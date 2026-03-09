import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AnalyticsService {
  constructor(private ordersService: OrdersService) {}

  async getRevenue() {
    const orders = await this.ordersService.findAll();
    const total = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((s, item) => s + (item.price || 0) * item.quantity, 0);
      return sum + orderTotal;
    }, 0);
    return { total, orderCount: orders.length };
  }

  async getPopularItems() {
    const orders = await this.ordersService.findAll();
    const counts: Record<string, { menuItemId: string; name: string; count: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!counts[item.menuItemId]) {
          counts[item.menuItemId] = { menuItemId: item.menuItemId, name: item.name || '', count: 0 };
        }
        counts[item.menuItemId].count += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }
}
