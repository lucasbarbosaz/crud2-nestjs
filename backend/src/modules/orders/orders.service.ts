import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { buildPagination, buildPaginationMeta } from '../../common/pagination/pagination.util';
import { OrderItem } from './order-item.entity';
import { DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const clientRepo = manager.getRepository(Client);
      const orderRepo = manager.getRepository(Order);
      const itemRepo = manager.getRepository(OrderItem);
      const productRepo = manager.getRepository(Product);

      const client = await clientRepo.findOne({ where: { id: dto.clientId } });
      if (!client) {
        throw new NotFoundException('Cliente não encontrado');
      }

      const quantityByProduct = new Map<number, number>();
      for (const item of dto.items) {
        quantityByProduct.set(
          item.productId,
          (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }

      const order = orderRepo.create({ client });
      const savedOrder = await orderRepo.save(order);

      const items: OrderItem[] = [];
      for (const [productId, totalQty] of quantityByProduct.entries()) {
        const product = await productRepo.findOne({
          where: { id: productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new NotFoundException(`Produto ${productId} não encontrado`);
        }
        if (totalQty > product.estoque) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto \"${product.descricao}\". Disponível: ${product.estoque}`,
          );
        }
      }

      for (const item of dto.items) {
        const product = await productRepo.findOne({
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new NotFoundException(`Produto ${item.productId} não encontrado`);
        }
        const orderItem = new OrderItem();
        orderItem.order = savedOrder;
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.unitPrice = product.valorVenda;
        items.push(orderItem);
      }

      await itemRepo.save(items);

      for (const [productId, totalQty] of quantityByProduct.entries()) {
        await productRepo.decrement({ id: productId }, 'estoque', totalQty);
      }

      const created = await orderRepo.findOne({ where: { id: savedOrder.id } });
      if (!created) {
        throw new NotFoundException('Pedido não encontrado');
      }
      return created;
    });
  }

  async findAll(pagination: PaginationDto) {
    const { skip, take } = buildPagination(pagination.page, pagination.limit);
    const [data, total] = await this.ordersRepository.findAndCount(skip, take);
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const productRepo = manager.getRepository(Product);

      const order = await orderRepo.findOne({
        where: { id },
        relations: { items: { product: true } },
      });
      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      for (const item of order.items ?? []) {
        if (item.product?.id) {
          await productRepo.increment({ id: item.product.id }, 'estoque', item.quantity);
        }
      }

      await orderRepo.delete(id);
      return { deleted: true };
    });
  }
}
