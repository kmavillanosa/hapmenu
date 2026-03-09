import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() body: any) {
    return this.ordersService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':vendorId')
  @UseGuards(JwtAuthGuard)
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.ordersService.findByVendor(vendorId);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
