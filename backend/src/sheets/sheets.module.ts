import { Module } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { SheetsController } from './sheets.controller';
import { FilterService } from './filter.service';

@Module({
  controllers: [SheetsController],
  providers: [SheetsService, FilterService],
  exports: [SheetsService],
})
export class SheetsModule {}
