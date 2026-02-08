import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Notebook Dell Latitude' })
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ example: 3499.9, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valorVenda: number;

  @ApiProperty({ example: 12, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estoque: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Indice da imagem principal' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  primaryIndex?: number;
}
