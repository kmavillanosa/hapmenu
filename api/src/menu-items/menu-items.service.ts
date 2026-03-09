import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../vendors/menu-item.entity';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemsRepo: Repository<MenuItem>,
  ) {}

  async findByVendor(vendorId: string): Promise<MenuItem[]> {
    return this.menuItemsRepo.find({
      where: { vendorId },
      order: { name: 'ASC' },
    });
  }

  async create(data: Partial<MenuItem>): Promise<MenuItem> {
    const item = this.menuItemsRepo.create(data);
    return this.menuItemsRepo.save(item);
  }

  async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    await this.menuItemsRepo.update(id, data);
    const item = await this.menuItemsRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.menuItemsRepo.delete(id);
  }
}
