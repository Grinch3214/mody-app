import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { FilterService } from './filter.service';
import { FilterQueryDto } from './filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

interface RequestWithUser {
  user?: unknown;
}

@Controller('sheets')
export class SheetsController {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly filterService: FilterService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  async getAll(@Query() query: FilterQueryDto, @Req() req: RequestWithUser) {
    return this.filterService.filter(query, !!req.user);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh() {
    await this.sheetsService.refresh();
    return { message: 'Refreshed' };
  }
}
