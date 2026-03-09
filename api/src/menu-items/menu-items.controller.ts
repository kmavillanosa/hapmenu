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
import { MenuItemsService } from './menu-items.service';

@Controller()
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get('vendors/:vendorId/menu')
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.menuItemsService.findByVendor(vendorId);
  }

  @Post('menu-items')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.menuItemsService.create(body);
  }

  @Put('menu-items/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.menuItemsService.update(id, body);
  }

  @Delete('menu-items/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}
