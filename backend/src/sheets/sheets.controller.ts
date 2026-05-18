import { Controller, Get, Post } from '@nestjs/common';
import { SheetsService } from './sheets.service';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Get()
  async getAll() {
    return this.sheetsService.getData();
  }

  @Post('refresh')
  async refresh() {
    await this.sheetsService.refresh();
    return { message: 'Cache refreshed' };
  }
}
