import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  getRevenue() {
    return this.analyticsService.getRevenue();
  }

  @Get('popular-items')
  @UseGuards(JwtAuthGuard)
  getPopularItems() {
    return this.analyticsService.getPopularItems();
  }
}
