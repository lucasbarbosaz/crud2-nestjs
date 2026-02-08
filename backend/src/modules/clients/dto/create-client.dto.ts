import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'GOOGLE BRASIL INTERNET LTDA.' })
  @IsNotEmpty()
  razaoSocial: string;

  @ApiProperty({ example: '06.990.590/0005-57' })
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  @IsEmail()
  email: string;
}
