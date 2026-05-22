import { Injectable } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { Product } from '../common/types/product.types';
import { FilterQueryDto } from './filter.dto';

@Injectable()
export class FilterService {
  constructor(private readonly sheetsService: SheetsService) {}

  private static readonly HIDDEN_SEGMENTS = ['тест', 'подарунки'];

  private static readonly SYNONYMS: [string, string][] = [
    // --- Масла / Oil ---
    ['олія', 'масло'],
    ['олія', 'oil'],
    ['масло', 'oil'],
    ['олійка', 'масло'],
    ['олійка', 'oil'],
    ['олійка', 'олія'],

    // --- Основные типы средств ---
    ['шовк', 'шелк'],
    ['сироватка', 'сыворотка'],
    ['сироватка', 'serum'],
    ['кондиціонер', 'кондиционер'],
    ['кондиціонер', 'conditioner'],
    ['пілінг', 'пилинг'],
    ['пілінг', 'peeling'],
    ['скраб', 'скраб'],
    ['скраб', 'scrub'],
    ['пінка', 'пенка'],
    ['пінка', 'foam'],
    ['ампули', 'ампулы'],
    ['ампули', 'ampoules'],
    ['кристали', 'кристаллы'],
    ['кристали', 'crystals'],
    ['флюїд', 'флюид'],
    ['флюїд', 'fluid'],

    // --- Действие и свойства (Существительные/Глаголы) ---
    ['відновлення', 'восстановление'],
    ['відновлення', 'repair'],
    ['зволоження', 'увлажнение'],
    ['зволоження', 'hydration'],
    ['зволоження', 'moisture'],
    ['живлення', 'питание'],
    ['живлення', 'nourishing'],
    ['догляд', 'уход'],
    ['догляд', 'care'],
    ['захист', 'защита'],
    ['захист', 'protection'],
    ['очищення', 'очищение'],
    ['очищення', 'cleansing'],
    ['зміцнення', 'укрепление'],
    ['зміцнення', 'strengthening'],
    ['блиск', 'блеск'],
    ['блиск', 'shine'],
    ['блиск', 'gloss'],
    ['ламінування', 'ламинирование'],
    ['тонування', 'тонирование'],
    ['тонування', 'toning'],
    ['розгладження', 'разглаживание'],
    ['розгладження', 'smoothing'],
    ['термозахист', 'термозащита'],
    ['термозахист', 'heat protection'],
    ["об'єм", 'объем'],
    ["об'єм", 'volume'],

    // --- Действие (Прилагательные/Корни) ---
    ['живильн', 'питател'],
    ['зволожуючий', 'увлажняющий'],
    ['відновлюючий', 'восстанавливающий'],
    ['зміцнюючий', 'укрепляющий'],
    ['очищуючий', 'очищающий'],
    ['розгладжуючий', 'разглаживающий'],
    ['незмивний', 'несмываемый'],
    ['незмивний', 'leave-in'],
    ['щоденний', 'ежедневный'],
    ['щоденний', 'daily'],

    // --- Проблемы и типы волос ---
    ['випадіння', 'выпадение'],
    ['випадіння', 'hair loss'],
    ['лупа', 'перхоть'],
    ['лупа', 'dandruff'],
    ['кучерявий', 'кудрявый'],
    ['кучерявий', 'вьющийся'],
    ['кучерявий', 'curly'],
    ['пошкоджений', 'поврежденный'],
    ['пошкоджений', 'damaged'],
    ['фарбований', 'окрашенный'],
    ['фарбований', 'colored'],
    ['сухий', 'сухой'],
    ['сухий', 'dry'],
    ['жирний', 'жирный'],
    ['жирний', 'oily'],
    ['тонкий', 'тонкий'],
    ['тонкий', 'fine'],
    ['тонкий', 'thin'],
    ['шкіра голови', 'кожа головы'],
    ['шкіра голови', 'scalp'],

    // --- Аксессуары и Техника ---
    ['гребінець', 'расческа'],
    ['гребінець', 'comb'],
    ['щітка', 'щетка'],
    ['щітка', 'brush'],
    ['праска', 'утюжок'],
    ['праска', 'straightener'],
    ['затискач', 'зажим'],
    ['затискач', 'clip'],
    ['рушник', 'полотенце'],
    ['рушник', 'towel'],
    ['рукавички', 'перчатки'],
    ['рукавички', 'gloves'],
    ['пеньюар', 'накидка'],
    ['пеньюар', 'cape'],
    ['комірці', 'воротнички'],
  ];

  private expandTerm(term: string): string[] {
    const lower = term.toLowerCase();
    const terms = new Set<string>([lower]);

    for (const [uk, ru] of FilterService.SYNONYMS) {
      if (lower.includes(uk)) terms.add(lower.replace(uk, ru));
      if (lower.includes(ru)) terms.add(lower.replace(ru, uk));
    }

    return [...terms];
  }

  async filter(query: FilterQueryDto, withStock = false): Promise<Product[]> {
    const products = await this.sheetsService.getData();
    const filters = this.buildFilters(query);

    let result = filters.length
      ? products.filter((p) => filters.every((fn) => fn(p)))
      : products;

    if (withStock) return result;

    result = result.filter(
      (p) =>
        !FilterService.HIDDEN_SEGMENTS.some((s) =>
          p.segment.toLowerCase().includes(s),
        ),
    );

    return result.map((p) => ({ ...p, stock: null }));
  }

  private buildFilters(query: FilterQueryDto): Array<(p: Product) => boolean> {
    const filters: Array<(p: Product) => boolean> = [];
    const match = (value: string, search: string) =>
      value.toLowerCase().includes(search.toLowerCase());

    if (query.segment) {
      const segs = query.segment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      filters.push((p) => segs.some((s) => match(p.segment, s)));
    }
    if (query.brand) filters.push((p) => match(p.brand, query.brand!));
    if (query.name) {
      const terms = this.expandTerm(query.name.trim());
      filters.push((p) => terms.some((t) => match(p.name, t)));
    }

    return filters;
  }
}
