import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
  ) {}

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.ordersRepo.create(data);
    return this.ordersRepo.save(order);
  }

  async findByVendor(vendorId: string): Promise<Order[]> {
    return this.ordersRepo.find({ where: { vendorId }, order: { createdAt: 'DESC' } });
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.ordersRepo.update(id, { status });
    return this.ordersRepo.findOne({ where: { id } });
  }
}
