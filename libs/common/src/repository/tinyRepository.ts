import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { ExternalProduct } from '../database/model/dto/externalProduct.interface';
import {
  ExternalRepository,
  FetchParametersInterface,
} from './externalRepository.interface';
import {
  ImportedInvoiceDTO,
  ImportedSaleDTO,
} from '../database/model/dto/importedSaleDTO.interface';

export class TinyRepository implements ExternalRepository {
  httpService: HttpService;
  baseUrl = 'https://api.tiny.com.br/api2';
  authToken: string;

  constructor(httpService: HttpService, authToken) {
    this.httpService = httpService;
    this.authToken = authToken;
  }

  async getProducts(page: number): Promise<ExternalProduct[]> {
    const result: ExternalProduct[] = [];
    const response = await this.fetch({
      url: '/produtos.pesquisa.php',
      parameters: {
        formato: 'json',
        pagina: page,
      },
    });

    if (
      response.retorno?.status === 'OK' ||
      response.retorno?.produtos?.length > 0
    ) {
      for (const { produto } of response.retorno?.produtos) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          const product = await this.getProductInformation(produto.id);
          let listKit: { id: string; quantity: number }[] = [];

          if (product.kit) {
            listKit = product.kit.map((e) => {
              return { id: e.item.id_produto, quantity: e.item.quantidade };
            });
          }

          result.push({
            codigo: product.codigo,
            descricao: product.nome,
            estoqueAtual: product.saldo,
            nomeFornecedor: product.nome_fornecedor,
            observacoes: product.obs,
            preco: product.preco,
            precoCusto: product.preco_custo,
            isComposed:
              Boolean(product.unidade.toLowerCase() === 'kit') ||
              (product.kit && product.kit.length > 0),
            idIntegration: product.id,
            productKits: listKit,
          });
        } catch (error) {
          console.log(`error during import product ${produto.id}`);
          console.log(error);
        }
      }
    }

    return result;
  }

  async getSales(
    page: number,
    startDate: string,
    endDate: string,
  ): Promise<ImportedSaleDTO[]> {
    const result: ImportedSaleDTO[] = [];
    const response = await this.fetch({
      url: '/pedidos.pesquisa.php',
      parameters: {
        formato: 'json',
        pagina: page,
        dataInicial: startDate,
        dataFinal: endDate,
      },
    });

    console.log(`fetching sales between dates ${startDate}, and ${endDate}`);

    if (
      response.retorno?.status === 'OK' ||
      response.retorno?.pedidos?.length > 0
    ) {
      for (const { pedido } of response.retorno?.pedidos) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const sale = await this.getSaleInformation(pedido.id);

          result.push({
            numero: sale.numero,
            cliente: {
              nome: sale.cliente.nome,
              fone: '',
            },
            marketplace: '',
            data: moment(sale.data_pedido, 'DD/MM/yyyy')
              .add(3, 'hours')
              .toDate(),
            itens: sale.itens.map((itemData) => {
              const { item } = itemData;

              return {
                codigo: item.codigo,
                descricao: item.descricao,
                quantidade: item.quantidade,
              };
            }),
          });
        } catch (error) {
          console.log(`Error getting sale ${pedido.id}`);
        }
      }
    }

    return result;
  }

  async getInvoices(
    page: number,
    startDate: string,
    endDate: string,
  ): Promise<{ result: ImportedInvoiceDTO[]; errorQtd: number }> {
    let errorQtd = 0;
    const result: ImportedInvoiceDTO[] = [];
    const response = await this.fetch({
      url: '/notas.fiscais.pesquisa.php',
      parameters: {
        formato: 'json',
        pagina: page,
        dataInicial: startDate,
        dataFinal: endDate,
      },
    });

    console.log(`fetching sales between dates ${startDate}, and ${endDate}`);

    if (
      response.retorno?.status === 'OK' ||
      response.retorno?.notas_fiscais?.length > 0
    ) {
      for (const { nota_fiscal } of response.retorno?.notas_fiscais) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const invoice = await this.getInvoiceInformation(nota_fiscal.id);

          result.push({
            numero: invoice.numero,
            cliente: {
              nome: invoice.cliente.nome,
              fone: invoice.cliente.fone || '',
            },
            marketplace: '',
            data: moment(invoice.data_emissao, 'DD/MM/yyyy')
              .add(3, 'hours')
              .toDate(),
            itens: invoice.itens.map((itemData) => {
              const { item } = itemData;

              return {
                codigo: item.codigo,
                descricao: item.descricao,
                quantidade: Number(item.quantidade),
              };
            }),
            xml: '',
          });
        } catch (error) {
          errorQtd++;
        }
      }
    }

    return {
      errorQtd,
      result,
    };
  }

  private async getProductInformation(id: string) {
    const data = await this.fetch({
      url: '/produto.obter.php',
      parameters: {
        formato: 'json',
        id,
      },
    });

    const dataStoredQuantity = await this.fetch({
      url: '/produto.obter.estoque.php',
      parameters: {
        formato: 'json',
        id,
      },
    });

    const product = data;
    const storedQuantity = dataStoredQuantity;

    return {
      ...storedQuantity.retorno.produto,
      ...product.retorno.produto,
    };
  }

  async getSaleInformation(id: string) {
    const data = await this.fetch({
      url: '/pedido.obter.php',
      parameters: {
        formato: 'json',
        id,
      },
    });

    const product = data;

    return {
      ...product.retorno.pedido,
    };
  }

  private async getInvoiceInformation(id: string) {
    const data = await this.fetch({
      url: '/nota.fiscal.obter.php',
      parameters: {
        formato: 'json',
        id,
      },
    });

    const product = data;

    return {
      ...product.retorno.nota_fiscal,
    };
  }

  private async fetch(parameters: FetchParametersInterface): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${parameters.url}`, {
          params: {
            token: this.authToken,
            ...parameters.parameters,
          },
        }),
      );

      if (
        data.retorno.status == 'Erro' ||
        (data.retorno.erros && data.retorno.erros.length > 0)
      ) {
        console.log(
          `Error during getProducts: ${JSON.stringify(data.retorno.erros)}`,
        );

        throw new Error(JSON.stringify(data.retorno.erros));
      }

      return data;
    } catch (error) {
      console.error(`Error during HTTP request: ${error}`);
      throw error;
    }
  }
}
