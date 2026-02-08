import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  create(data: Partial<Product>) {
    return this.repo.create(data);
  }

  save(product: Product) {
    return this.repo.save(product);
  }

  saveImages(images: ProductImage[]) {
    return this.imageRepo.save(images);
  }

  findImageById(productId: number, imageId: number) {
    return this.imageRepo.findOne({
      where: {
        id: imageId,
        product: { id: productId },
      },
      relations: { product: true },
    });
  }

  async setPrimaryImage(productId: number, imageId: number) {
    await this.imageRepo.update({ product: { id: productId } }, { isPrimary: false });
    await this.imageRepo.update({ id: imageId }, { isPrimary: true });
  }

  findAndCount(skip: number, take: number) {
    return this.repo.findAndCount({ skip, take, order: { id: 'DESC' } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
