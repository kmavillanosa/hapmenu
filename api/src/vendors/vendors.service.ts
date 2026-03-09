import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorsRepo: Repository<Vendor>,
  ) {}

  private normalizeSubdomain(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async subdomainExists(
    subdomain: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.vendorsRepo.findOne({ where: { subdomain } });
    if (!existing) {
      return false;
    }
    if (!excludeId) {
      return true;
    }
    return existing.id !== excludeId;
  }

  private async generateUniqueSubdomain(
    seed: string,
    excludeId?: string,
  ): Promise<string> {
    const base = this.normalizeSubdomain(seed) || 'vendor';
    let candidate = base;
    let suffix = 1;

    while (await this.subdomainExists(candidate, excludeId)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
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
    const seed = data.subdomain || data.name || 'vendor';
    data.subdomain = await this.generateUniqueSubdomain(seed);
    const vendor = this.vendorsRepo.create(data);
    return this.vendorsRepo.save(vendor);
  }

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    const existing = await this.findById(id);
    if (data.subdomain || data.name) {
      const seed = data.subdomain || data.name || existing.subdomain;
      data.subdomain = await this.generateUniqueSubdomain(seed, id);
    }
    await this.vendorsRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.vendorsRepo.delete(id);
  }
}
