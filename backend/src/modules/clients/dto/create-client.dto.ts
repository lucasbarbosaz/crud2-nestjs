import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({ example: 'GOOGLE BRASIL INTERNET LTDA.' })
  @IsNotEmpty()
  razaoSocial: string;

  @ApiProperty({ example: '06.990.590/0005-57' })
  @IsNotEmpty()
  @Transform(({ value }) => (value ?? '').toString().replace(/\D/g, ''))
  @Matches(/^\d{14}$/, { message: 'CNPJ inválido' })
  cnpj: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  @IsEmail()
  email: string;
}
