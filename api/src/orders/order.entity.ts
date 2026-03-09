import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface OrderLineItem {
  itemId: string;
  type: 'menu' | 'service';
  quantity: number;
  name?: string;
  price?: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  PREPARING = 'Preparing',
  COMPLETED = 'Completed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  vendorId: string;

  @Column('json')
  items: OrderLineItem[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
