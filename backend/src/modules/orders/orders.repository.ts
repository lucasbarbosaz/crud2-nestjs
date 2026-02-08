import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findClientById(id: number) {
    return this.clientRepo.findOne({ where: { id } });
  }

  findProductById(id: number) {
    return this.productRepo.findOne({ where: { id } });
  }

  createOrder(data: Partial<Order>) {
    return this.orderRepo.create(data);
  }

  saveOrder(order: Order) {
    return this.orderRepo.save(order);
  }

  saveItems(items: OrderItem[]) {
    return this.itemRepo.save(items);
  }

  findAndCount(skip: number, take: number) {
    return this.orderRepo.findAndCount({ skip, take, order: { id: 'DESC' } });
  }

  findById(id: number) {
    return this.orderRepo.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.orderRepo.delete(id);
  }
}
