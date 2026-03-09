import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceItem } from './service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceItem)
    private readonly servicesRepo: Repository<ServiceItem>,
  ) {}

  async findByVendor(vendorId: string): Promise<ServiceItem[]> {
    return this.servicesRepo.find({
      where: { vendorId },
      order: { name: 'ASC' },
    });
  }

  async create(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const item = this.servicesRepo.create(data);
    return this.servicesRepo.save(item);
  }

  async update(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    await this.servicesRepo.update(id, data);
    const item = await this.servicesRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Service not found');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.servicesRepo.delete(id);
  }
}
