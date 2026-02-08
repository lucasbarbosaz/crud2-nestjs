import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  create(data: Partial<Client>) {
    return this.repo.create(data);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByCnpj(cnpj: string) {
    return this.repo.findOne({ where: { cnpj } });
  }

  save(client: Client) {
    return this.repo.save(client);
  }

  findAndCount(skip: number, take: number) {
    return this.repo.findAndCount({ skip, take, order: { id: 'DESC' } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
