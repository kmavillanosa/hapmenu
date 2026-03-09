import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
  items: { menuItemId: string; quantity: number; name?: string; price?: number }[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
