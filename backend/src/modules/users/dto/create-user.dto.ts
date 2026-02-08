import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Flavio Barbosa' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'flavio@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: Role, example: Role.USUARIO })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
