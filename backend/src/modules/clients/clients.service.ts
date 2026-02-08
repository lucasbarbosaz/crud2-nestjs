import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { buildPagination, buildPaginationMeta } from '../../common/pagination/pagination.util';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async create(dto: CreateClientDto) {
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
    if (dto.cnpj && dto.cnpj !== client.cnpj) {
      const existingByCnpj = await this.clientsRepository.findByCnpj(dto.cnpj);
      if (existingByCnpj) {
        throw new BadRequestException('CNPJ já cadastrado');
      }
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
}
