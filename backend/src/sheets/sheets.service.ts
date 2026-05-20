import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';
import { DbService } from '../db/db.service';
import { products, DbProduct } from '../db/schema';
import { Product, Stock } from '../common/types/product.types';

const REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 часа

@Injectable()
export class SheetsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SheetsService.name);
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly dbService: DbService,
  ) {}

  async onModuleInit() {
    await this.refresh();
    this.scheduleNext();
  }

  onModuleDestroy() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  async getData(): Promise<Product[]> {
    const rows: DbProduct[] = await this.dbService.db.select().from(products);
    return rows.map((r) => ({
      segment: r.segment,
      brand: r.brand,
      name: r.name,
      volume: r.volume,
      prices: r.prices,
      stock: r.stock ?? null,
    }));
  }

  async refresh(): Promise<void> {
    this.logger.log('Refreshing sheets...');

    const [productList, inventory] = await Promise.all([
      this.fetchPriceSheet(),
      this.fetchInventory(),
    ]);

    const rows = productList.map((p) => ({
      segment: p.segment,
      brand: p.brand,
      name: p.name,
      volume: p.volume,
      prices: p.prices,
      stock: inventory.get(p.name.toLowerCase()) ?? null,
    }));

    await this.dbService.db.delete(products);

    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await this.dbService.db
        .insert(products)
        .values(rows.slice(i, i + chunkSize));
    }

    this.logger.log(`Saved ${rows.length} products to DB`);

    // Сбрасываем таймер — 2 часа отсчитываются от этого момента
    this.scheduleNext();
  }

  private scheduleNext() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      void this.refresh();
    }, REFRESH_INTERVAL_MS);
  }

  private async fetchPriceSheet(): Promise<Omit<Product, 'stock'>[]> {
    this.logger.log('Fetching price sheet...');
    const rows = await this.fetchSheetRows('GOOGLE_SHEET_ID');
    if (rows.length < 3) return [];

    const columnNames = this.buildColumnNames(rows[0], rows[1]);

    return rows
      .slice(2)
      .map((row) => this.normalizeProductRow(row, columnNames))
      .filter((p): p is Omit<Product, 'stock'> => p !== null);
  }

  private async fetchInventory(): Promise<Map<string, Stock>> {
    this.logger.log('Fetching inventory sheet...');
    const rows = await this.fetchSheetRows('GOOGLE_INVENTORY_SHEET_ID');
    const map = new Map<string, Stock>();

    // 2 строки заголовков, данные с индекса 2
    // Структура: [0]=Код [2]=Товар [3]=Объем [8]=Остаток мл [9]=Остаток шт ("554,90")
    for (const row of rows.slice(2)) {
      const name = row[2]?.trim();
      if (!name) continue;

      const volume = Number(row[3]) || 0;
      const totalMl = Number(row[8]) || 0;
      const stockRaw = parseFloat((row[9] ?? '0').replace(',', '.'));

      const bottles = Math.floor(stockRaw);
      const openMl = Math.round((stockRaw - bottles) * volume);

      map.set(name.toLowerCase(), { bottles, openMl, totalMl });
    }

    this.logger.log(`Inventory loaded: ${map.size} items`);
    return map;
  }

  private async fetchSheetRows(envKey: string): Promise<string[][]> {
    const id = this.config.getOrThrow<string>(envKey);
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch sheet [${envKey}]: ${response.status} ${response.statusText}`,
      );
    }

    return parse(await response.text(), { trim: true });
  }

  private normalizeProductRow(
    row: string[],
    columns: string[],
  ): Omit<Product, 'stock'> | null {
    const get = (col: string) => row[columns.indexOf(col)]?.trim() ?? '';
    const toPrice = (col: string): number | null => {
      const raw = get(col);
      return raw ? Number(raw) : null;
    };

    const segment = get('Сегмент');
    const name = get('Назва') || get('Название');
    if (!name || !segment) return null;

    const isRetail = segment.toLowerCase().includes('уход');

    return {
      segment,
      brand: get('Бренд'),
      name,
      volume: this.parseVolume(get('Обʼєм') || get('Объём')),
      prices: {
        full: toPrice('Ціни дівчат РРЦ'),
        retail: isRetail ? toPrice('Ціни сайтів РРЦ') : null,
        500: toPrice('Ціни дівчат 500'),
        250: toPrice('Ціни дівчат 250'),
        100: toPrice('Ціни дівчат 100'),
        50: toPrice('Ціни дівчат 50'),
      },
    };
  }

  // Таблица имеет 2 строки заголовков:
  // row1: "Сегмент", "Бренд", ..., "Ціни дівчат", "", ..., "Ціни сайтів", ...
  // row2: "",        "",     ..., "РРЦ", "500", "250", ...
  // Объединяем: "Сегмент", "Бренд", ..., "Ціни дівчат РРЦ", "Ціни дівчат 500", ...
  private parseVolume(raw: string): number {
    const n = parseInt(raw || '0', 10);
    return isNaN(n) ? 0 : n;
  }

  private buildColumnNames(row1: string[], row2: string[]): string[] {
    const len = Math.max(row1.length, row2.length);
    const names: string[] = [];
    let groupPrefix = '';

    for (let i = 0; i < len; i++) {
      const top = row1[i] ?? '';
      const sub = row2[i] ?? '';

      if (top) groupPrefix = top;

      if (top && !sub) {
        names.push(top);
      } else if (sub) {
        names.push(groupPrefix ? `${groupPrefix} ${sub}` : sub);
      } else {
        names.push(`col_${i}`);
      }
    }

    return names;
  }
}
