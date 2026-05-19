import { Injectable } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { Product } from '../common/types/product.types';
import { FilterQueryDto } from './filter.dto';

@Injectable()
export class FilterService {
  constructor(private readonly sheetsService: SheetsService) {}

  async filter(query: FilterQueryDto, withStock = false): Promise<Product[]> {
    const products = await this.sheetsService.getData();
    const filters = this.buildFilters(query);

    const result = filters.length
      ? products.filter((p) => filters.every((fn) => fn(p)))
      : products;

    if (withStock) return result;

    return result.map((p) => ({ ...p, stock: null }));
  }

  private buildFilters(query: FilterQueryDto): Array<(p: Product) => boolean> {
    const filters: Array<(p: Product) => boolean> = [];
    const match = (value: string, search: string) =>
      value.toLowerCase().includes(search.toLowerCase());

    if (query.segment) filters.push((p) => match(p.segment, query.segment!));
    if (query.brand) filters.push((p) => match(p.brand, query.brand!));
    if (query.name) filters.push((p) => match(p.name, query.name!));

    return filters;
  }
}
