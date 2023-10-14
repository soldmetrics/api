export interface ExternalProduct {
  codigo: string;
  descricao: string;
  preco: string;
  precoCusto: string;
  nomeFornecedor: string;
  estoqueAtual: number;
  observacoes: string;
  isComposed?: boolean;
  idIntegration: string;
  productKits: ExternalProductKit[];
  parentCode?: string;
}

export interface ExternalProductKit {
  id: string;
  quantity: number;
}
