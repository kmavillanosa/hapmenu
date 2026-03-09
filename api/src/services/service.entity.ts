import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vendor } from '../vendors/vendor.entity';

@Entity('services')
export class ServiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  duration?: number | null;

  @Column({ default: true })
  available: boolean;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;
}
