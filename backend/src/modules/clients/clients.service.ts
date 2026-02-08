import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { buildPagination, buildPaginationMeta } from '../../common/pagination/pagination.util';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async create(dto: CreateClientDto) {
    await this.assertCnpjExists(dto.cnpj);
    const existingByCnpj = await this.clientsRepository.findByCnpj(dto.cnpj);
    if (existingByCnpj) {
      throw new BadRequestException('CNPJ já cadastrado');
    }
    const existingByEmail = await this.clientsRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new BadRequestException('E-mail já cadastrado');
    }
    const client = this.clientsRepository.create(dto);
    return this.clientsRepository.save(client);
  }

  async findAll(pagination: PaginationDto) {
    const { skip, take } = buildPagination(pagination.page, pagination.limit);
    const [data, total] = await this.clientsRepository.findAndCount(skip, take);
    return { data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async findOne(id: number) {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    const client = await this.findOne(id);
    if (dto.cnpj) {
      const nextCnpj = dto.cnpj.replace(/\D/g, '');
      const currentCnpj = (client.cnpj ?? '').replace(/\D/g, '');
      if (nextCnpj !== currentCnpj) {
        await this.assertCnpjExists(nextCnpj);
        const existingByCnpj = await this.clientsRepository.findByCnpj(nextCnpj);
        if (existingByCnpj) {
          throw new BadRequestException('CNPJ já cadastrado');
        }
      }
      dto.cnpj = nextCnpj;
    }
    if (dto.email && dto.email !== client.email) {
      const existingByEmail = await this.clientsRepository.findByEmail(dto.email);
      if (existingByEmail) {
        throw new BadRequestException('E-mail já cadastrado');
      }
    }
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.clientsRepository.delete(id);
    return { deleted: true };
  }

  private async assertCnpjExists(cnpj: string) {
    const digits = (cnpj ?? '').replace(/\D/g, '');
    if (digits.length !== 14) {
      throw new BadRequestException('CNPJ inválido');
    }
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`);
    if (!response.ok) {
      throw new BadRequestException('CNPJ não encontrado');
    }
  }
}
