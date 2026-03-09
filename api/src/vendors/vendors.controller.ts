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
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get('vendors')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get('vendors/:subdomain')
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.vendorsService.findBySubdomain(subdomain);
  }

  @Post('vendors')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.vendorsService.create(body);
  }

  @Put('vendors/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.vendorsService.update(id, body);
  }

  @Delete('vendors/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
