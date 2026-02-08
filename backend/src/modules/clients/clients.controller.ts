import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller({ path: 'clients', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Criar cliente (ADMIN)' })
  @ApiBody({ type: CreateClientDto })
  @ApiCreatedResponse({ description: 'Cliente criado com sucesso' })
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @ApiOperation({ summary: 'Listar clientes (ADMIN)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'Lista paginada de clientes' })
  @Get()
  @Roles(Role.ADMIN, Role.USUARIO)
  findAll(@Query() pagination: PaginationDto) {
    return this.clientsService.findAll(pagination);
  }

  @ApiOperation({ summary: 'Buscar cliente por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Cliente encontrado' })
  @Get(':id')
  @Roles(Role.ADMIN, Role.USUARIO)
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Atualizar cliente por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateClientDto })
  @ApiOkResponse({ description: 'Cliente atualizado com sucesso' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(Number(id), dto);
  }

  @ApiOperation({ summary: 'Remover cliente por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Cliente removido com sucesso' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(Number(id));
  }
}
