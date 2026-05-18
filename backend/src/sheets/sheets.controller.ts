import { Controller, Get, Post, Query } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { FilterService } from './filter.service';
import { FilterQueryDto } from './filter.dto';

@Controller('sheets')
export class SheetsController {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly filterService: FilterService,
  ) {}

  @Get()
  async getAll(@Query() query: FilterQueryDto) {
    return this.filterService.filter(query);
  }

  @Post('refresh')
  async refresh() {
    await this.sheetsService.refresh();
    return { message: 'Cache refreshed' };
  }
}
