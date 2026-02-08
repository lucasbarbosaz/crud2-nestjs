import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { buildPagination, buildPaginationMeta } from '../../common/pagination/pagination.util';
import { ProductImage } from './product-image.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const product = this.productsRepository.create(dto);
    const saved = await this.productsRepository.save(product);
    if (files && files.length > 0) {
      const primaryIndex =
        typeof dto.primaryIndex === 'number' && dto.primaryIndex >= 0
          ? dto.primaryIndex
          : 0;
      const images = files.map((file, index) => {
        const image = new ProductImage();
        image.url = `/uploads/${file.filename}`;
        image.product = saved;
        image.isPrimary = index === primaryIndex;
        return image;
      });
      await this.productsRepository.saveImages(images);
    }
    return this.findOne(saved.id);
  }

  async findAll(pagination: PaginationDto) {
    const { skip, take } = buildPagination(pagination.page, pagination.limit);
    const [data, total] = await this.productsRepository.findAndCount(skip, take);
    data.forEach((product) => {
      if (product.images?.length) {
        product.images.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
      }
    });
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    if (product.images?.length) {
      product.images.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto, files?: Express.Multer.File[]) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const saved = await this.productsRepository.save(product);
    if (files && files.length > 0) {
      const hasPrimary = !!saved.images?.some((image) => image.isPrimary);
      const images = files.map((file, index) => {
        const image = new ProductImage();
        image.url = `/uploads/${file.filename}`;
        image.product = saved;
        image.isPrimary = !hasPrimary && index === 0;
        return image;
      });
      await this.productsRepository.saveImages(images);
    }
    return this.findOne(saved.id);
  }

  async setDefaultImage(productId: number, imageId: number) {
    const image = await this.productsRepository.findImageById(productId, imageId);
    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }
    if (image.isPrimary) {
      throw new BadRequestException('Imagem já é a principal');
    }
    await this.productsRepository.setPrimaryImage(productId, imageId);
    return this.findOne(productId);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productsRepository.delete(id);
    return { deleted: true };
  }
}
