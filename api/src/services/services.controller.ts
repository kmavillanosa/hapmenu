import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('vendors/:vendorId/services')
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.servicesService.findByVendor(vendorId);
  }

  @Post('services')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.servicesService.create(body);
  }

  @Put('services/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.update(id, body);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
