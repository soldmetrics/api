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
  @IsNotEmpty()
  cnpj: string;

  idEcommerce: string;

  tipo: string;

  versao: string;

  @IsNotEmptyObject()
  dados: ReceiveSaleDataTiny;
}
