import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('CNPJ')
@Controller({ path: 'cnpj', version: '1' })
export class CnpjController {
  @ApiOperation({ summary: 'Consultar CNPJ (proxy)' })
  @ApiParam({ name: 'cnpj', type: String, example: '06990590000557' })
  @ApiOkResponse({ description: 'Dados retornados pela API pública' })
  @Get(':cnpj')
  async lookup(@Param('cnpj') cnpj: string) {
    const digits = (cnpj || '').replace(/\D/g, '');
    if (digits.length !== 14) {
      throw new BadRequestException('CNPJ inválido');
    }
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`);
    if (!response.ok) {
      const text = await response.text();
      throw new BadRequestException(text || 'Falha ao consultar CNPJ');
    }
    return response.json();
  }
}
