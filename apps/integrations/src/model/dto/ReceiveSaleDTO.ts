import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';

export interface ReceiveSaleDataTiny {
  id: string;
  idPedidoEcommerce: string;
  numero: string;
  idVendaTiny: string;
  situacao: string;
  descricaoSituacao: string;
}

export class ReceiveSaleTinyDTO {
  @ApiProperty()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty()
  idEcommerce: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  versao: string;

  @ApiProperty()
  @IsNotEmptyObject()
  dados: ReceiveSaleDataTiny;
}
