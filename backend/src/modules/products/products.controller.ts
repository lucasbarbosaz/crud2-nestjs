import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Products')
@ApiBearerAuth()
@Controller({ path: 'products', version: '1' })
//guards pra proteger as rotas.
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Criar produto com imagens (ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['descricao', 'valorVenda', 'estoque'],
      properties: {
        descricao: { type: 'string', example: 'Notebook Dell Latitude' },
        valorVenda: { type: 'number', example: 3499.9 },
        estoque: { type: 'integer', example: 10 },
        primaryIndex: { type: 'integer', example: 0 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Produto criado com sucesso' })
  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadsDir = join(process.cwd(), 'uploads');
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(@Body() dto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.productsService.create(dto, files);
  }

  @ApiOperation({ summary: 'Listar produtos' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'Lista paginada de produtos' })
  @Get()
  @Roles(Role.ADMIN, Role.USUARIO)
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination);
  }

  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Produto encontrado' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.USUARIO)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Atualizar produto por ID (ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string', example: 'Notebook Dell Latitude' },
        valorVenda: { type: 'number', example: 3499.9 },
        estoque: { type: 'integer', example: 10 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Produto atualizado com sucesso' })
  @Put(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadsDir = join(process.cwd(), 'uploads');
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.update(Number(id), dto, files);
  }

  @ApiOperation({ summary: 'Definir imagem principal (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiParam({ name: 'imageId', type: Number, example: 10 })
  @ApiOkResponse({ description: 'Imagem principal atualizada' })
  @Put(':id/images/:imageId/default')
  @Roles(Role.ADMIN)
  setDefaultImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.setDefaultImage(Number(id), Number(imageId));
  }

  @ApiOperation({ summary: 'Remover produto por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Produto removido com sucesso' })
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(Number(id));
  }
}
