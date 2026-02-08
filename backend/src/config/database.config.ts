import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/user.entity';
import { Client } from '../modules/clients/client.entity';
import { Product } from '../modules/products/product.entity';
import { ProductImage } from '../modules/products/product-image.entity';
import { Order } from '../modules/orders/order.entity';
import { OrderItem } from '../modules/orders/order-item.entity';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<number>('DB_PORT', 3306)),
    username: config.get<string>('DB_USER', 'root'),
    password: config.get<string>('DB_PASSWORD', 'root'),
    database: config.get<string>('DB_NAME', 'excellent'),
    entities: [User, Client, Product, ProductImage, Order, OrderItem],
    synchronize: true,
  }),
};
