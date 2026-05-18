import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'csv-parse/sync';

const CACHE_TTL_MS = 5 * 60 * 1000;

export interface ProductPrices {
  full: number | null;
  500: number | null;
  250: number | null;
  100: number | null;
  50: number | null;
}

export interface Stock {
  bottles: number;
  openMl: number;
  totalMl: number;
}

export interface Product {
  segment: string;
  brand: string;
  name: string;
  volume: number;
  prices: ProductPrices;
  stock: Stock | null;
}

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);
  private cachedData: Product[] = [];
  private lastFetched: number | null = null;

  constructor(private readonly config: ConfigService) {}

  async getData(): Promise<Product[]> {
    if (this.lastFetched && Date.now() - this.lastFetched < CACHE_TTL_MS) {
      return this.cachedData;
    }
    await this.refresh();
    return this.cachedData;
  }

  async refresh(): Promise<void> {
    const [products, inventory] = await Promise.all([
      this.fetchPriceSheet(),
      this.fetchInventory(),
    ]);

    this.cachedData = products.map((p) => ({
      ...p,
      stock: inventory.get(p.name.toLowerCase()) ?? null,
    }));

    this.lastFetched = Date.now();
    this.logger.log(`Loaded ${this.cachedData.length} products`);
  }

  private async fetchPriceSheet(): Promise<Omit<Product, 'stock'>[]> {
    const id = this.config.getOrThrow<string>('GOOGLE_SHEET_ID');
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;

    this.logger.log('Fetching price sheet...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Price sheet fetch failed: ${response.status} ${response.statusText}`,
      );
    }

    const rows = parse(await response.text(), { trim: true });
    if (rows.length < 3) return [];

    const columnNames = this.buildColumnNames(rows[0], rows[1]);

    return rows
      .slice(2)
      .map((row) => this.normalizeProductRow(row, columnNames))
      .filter((p): p is Omit<Product, 'stock'> => p !== null);
  }

  private async fetchInventory(): Promise<Map<string, Stock>> {
    const id = this.config.getOrThrow<string>('GOOGLE_INVENTORY_SHEET_ID');
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;

    this.logger.log('Fetching inventory sheet...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Inventory fetch failed: ${response.status} ${response.statusText}`,
      );
    }

    const rows = parse(await response.text(), { trim: true });
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

    return {
      segment,
      brand: get('Бренд'),
      name,
      volume: Number(get('Обʼєм') || get('Объём') || 0),
      prices: {
        full: toPrice('Ціни дівчат РРЦ'),
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
