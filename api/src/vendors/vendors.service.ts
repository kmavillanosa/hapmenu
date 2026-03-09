import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { MenuItem } from './menu-item.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepo: Repository<Vendor>,
    @InjectRepository(MenuItem)
    private menuItemsRepo: Repository<MenuItem>,
  ) {}

  generateSubdomain(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorsRepo.find();
  }

  async findBySubdomain(subdomain: string): Promise<Vendor> {
    const vendor = await this.vendorsRepo.findOne({ where: { subdomain } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findById(id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(data: Partial<Vendor>): Promise<Vendor> {
    if (!data.subdomain && data.name) {
      data.subdomain = this.generateSubdomain(data.name);
    }
    const vendor = this.vendorsRepo.create(data);
    return this.vendorsRepo.save(vendor);
  }

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    await this.vendorsRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.vendorsRepo.delete(id);
  }

  async getMenu(vendorId: string): Promise<MenuItem[]> {
    return this.menuItemsRepo.find({ where: { vendorId } });
  }

  async createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
    const item = this.menuItemsRepo.create(data);
    return this.menuItemsRepo.save(item);
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    await this.menuItemsRepo.update(id, data);
    const item = await this.menuItemsRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async removeMenuItem(id: string): Promise<void> {
    await this.menuItemsRepo.delete(id);
  }
}
