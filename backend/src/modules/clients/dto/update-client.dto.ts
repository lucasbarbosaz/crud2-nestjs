import { IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'GOOGLE BRASIL INTERNET LTDA.' })
  @IsOptional()
  razaoSocial?: string;

  @ApiPropertyOptional({ example: '06.990.590/0005-57' })
  @IsOptional()
  cnpj?: string;

  @ApiPropertyOptional({ example: 'contato@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
