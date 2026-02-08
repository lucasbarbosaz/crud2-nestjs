import { Module } from '@nestjs/common';
import { CnpjController } from './cnpj.controller';

@Module({
  controllers: [CnpjController],
})
export class CnpjModule {}
