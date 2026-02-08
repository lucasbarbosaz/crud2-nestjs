import { IsEmail, IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'GOOGLE BRASIL INTERNET LTDA.' })
  @IsOptional()
  razaoSocial?: string;

  @ApiPropertyOptional({ example: '06.990.590/0005-57' })
  @IsOptional()
  @Transform(({ value }) => (value ?? '').toString().replace(/\D/g, ''))
  @Matches(/^\d{14}$/, { message: 'CNPJ inválido' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'contato@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
