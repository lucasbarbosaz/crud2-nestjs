import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, { eager: true })
  client: Client;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientRazaoSocialSnapshot: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  clientCnpjSnapshot: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientEmailSnapshot: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
