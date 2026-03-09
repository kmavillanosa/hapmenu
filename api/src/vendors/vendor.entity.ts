import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { ServiceItem } from '../services/service.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  contactInfo: string;

  @OneToMany(() => MenuItem, (item) => item.vendor, {
    cascade: true,
    eager: true,
  })
  menuItems: MenuItem[];

  @OneToMany(() => ServiceItem, (item) => item.vendor, {
    cascade: true,
    eager: true,
  })
  services: ServiceItem[];

  @CreateDateColumn()
  createdAt: Date;
}
