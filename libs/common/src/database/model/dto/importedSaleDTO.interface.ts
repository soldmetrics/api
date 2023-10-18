export interface ImportedProductDTO {
  codigo: string;
  descricao: string;
  quantidade: string;
  valorunidade?: number;
  precocusto?: number;
}

export interface ImportedSaleDTO {
  data: Date;
  numero: string;
  marketplace: string;
  itens: ImportedProductDTO[];
  cliente: {
    nome: string;
    fone: string;
  };
}

export interface ImportedInvoiceDTO {
  data: Date;
  numero: string;
  xml: string;
  marketplace: string;
  itens: ImportedProductDTO[];
  cliente: {
    nome: string;
    fone: string;
  };
}
