import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AnalyticsService {
  constructor(private ordersService: OrdersService) {}

  async getRevenue() {
    const orders = await this.ordersService.findAll();
    const total = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (s, item) => s + (item.price || 0) * item.quantity,
        0,
      );
      return sum + orderTotal;
    }, 0);
    return { total, orderCount: orders.length };
  }

  async getPopularItems() {
    const orders = await this.ordersService.findAll();
    const counts: Record<
      string,
      { itemId: string; type: 'menu' | 'service'; name: string; count: number }
    > = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.type}:${item.itemId}`;
        if (!counts[key]) {
          counts[key] = {
            itemId: item.itemId,
            type: item.type,
            name: item.name || '',
            count: 0,
          };
        }
        counts[key].count += item.quantity;
        if (!counts[key].name && item.name) {
          counts[key].name = item.name;
        }
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }
}
