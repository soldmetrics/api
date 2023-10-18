import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { xml2json } from 'xml-js';
import {
  ExternalRepository,
  FetchParametersInterface,
} from './externalRepository.interface';
import { ExternalProduct } from '../database/model/dto/externalProduct.interface';
import {
  ImportedInvoiceDTO,
  ImportedProductDTO,
  ImportedSaleDTO,
} from '../database/model/dto/importedSaleDTO.interface';

export class BlingRepository implements ExternalRepository {
  httpService: HttpService;
  baseUrl = 'https://bling.com.br/Api/v2';
  authToken: string;

  constructor(httpService: HttpService, authToken) {
    this.httpService = httpService;
    this.authToken = authToken;
  }
  getSaleInformation(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async getProducts(page: number): Promise<ExternalProduct[]> {
    console.log(
      `querying products on URL: ${this.baseUrl}/produtos/json for page: ${page}`,
    );
    const result: ExternalProduct[] = [];

    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = await this.fetch({
      url: `/produtos/page=${page}/json`,
      parameters: {
        // page: page,
        estoque: 'S',
      },
    });

    if (data.retorno && data.retorno?.produtos.length > 0) {
      for (const { produto: product } of data.retorno?.produtos) {
        const generalDeposit = product.depositos?.find((i) => {
          const { deposito } = i;

          return deposito.nome == 'Geral';
        }).deposito;

        result.push({
          codigo: product.codigo,
          descricao: product.descricao,
          estoqueAtual: generalDeposit ? generalDeposit.saldo : 0,
          nomeFornecedor: product.nomeFornecedor,
          observacoes: product.observacoes,
          preco: product.preco,
          precoCusto: product.precoCusto,
          idIntegration: product.id || '',
          isComposed: Boolean(
            product.estrutura && product.estrutura.length > 0,
          ),
          productKits: [],
          parentCode: product.codigoPai,
        });
      }
    }

    return result;
  }

  async getSales(
    page: number,
    startDate: string,
    endDate: string,
  ): Promise<ImportedSaleDTO[]> {
    console.log(
      `querying sales on URL: ${this.baseUrl}/pedidos/page=${page}/json from ${startDate} TO ${endDate}`,
    );
    const result: ImportedSaleDTO[] = [];

    const data = await this.fetch({
      url: `/pedidos/page=${page}/json`,
      parameters: {
        filters: `dataEmissao[${startDate} TO ${endDate}]`,
      },
    });

    if (
      data.retorno &&
      data.retorno?.pedidos &&
      data.retorno?.pedidos.length > 0
    ) {
      for (const { pedido: sale } of data.retorno?.pedidos) {
        const itens = sale.itens || [];

        try {
          const importedSale: ImportedSaleDTO = {
            numero: sale.numero,
            data: moment(sale.data, 'yyyy-MM-DD').toDate(),
            marketplace: sale.tipoIntegracao,
            cliente: {
              fone: sale.cliente.fone,
              nome: sale.cliente.nome,
            },
            itens: itens.map((productItem) => {
              const saleProduct = productItem.item;

              return {
                codigo: saleProduct.codigo,
                descricao: saleProduct.descricao,
                quantidade: saleProduct.quantidade,
                valorunidade: saleProduct.valorunidade,
                precocusto: saleProduct.precocusto,
              } as ImportedProductDTO;
            }),
          };

          result.push(importedSale);
        } catch (error) {
          console.error(
            `error during import sale number ${sale.numero}, error: \n ${error}`,
          );
        }
      }
    }

    return result;
  }

  async getInvoices(
    page: number,
    startDate: string,
    endDate: string,
    createdSaleNumbers?: string[],
  ): Promise<{ result: ImportedInvoiceDTO[]; errorQtd: number }> {
    let errorQtd = 0;
    const result: ImportedInvoiceDTO[] = [];

    const data = await this.fetch({
      url: `/notasfiscais/page=${page}/json`,
      parameters: {
        filters: `dataEmissao[${startDate} TO ${endDate}]`,
      },
    });

    if (data.retorno && data.retorno?.notasfiscais.length > 0) {
      for (const { notafiscal: invoice } of data.retorno?.notasfiscais) {
        try {
          const importedInvoice: ImportedInvoiceDTO = {
            cliente: {
              fone: invoice.cliente.fone,
              nome: invoice.cliente.nome,
            },
            marketplace: invoice.tipoIntegracao,
            numero: invoice.numero,
            data: moment(invoice.dataEmissao, 'yyyy-MM-DD HH:mm:ss').toDate(),
            itens: [],
            xml: invoice.xml,
          };

          if (
            !createdSaleNumbers ||
            !createdSaleNumbers.includes(importedInvoice.numero)
          ) {
            importedInvoice.itens = await this.getInvoiceItens(
              importedInvoice.xml,
            );

            console.log(
              `fetched ${importedInvoice.itens.length} invoice itens for invoice ${importedInvoice.numero}`,
            );

            result.push(importedInvoice);
          }
        } catch (error) {
          errorQtd++;
          console.error(
            `error during update product for invoice number ${invoice.numero}, error: \n${error}`,
          );
        }
      }
    }

    return { result, errorQtd };
  }

  private async getInvoiceItens(url: string): Promise<ImportedProductDTO[]> {
    const invoices: ImportedProductDTO[] = [];
    const { data } = await firstValueFrom(this.httpService.get(url));

    const json = JSON.parse(xml2json(data, { compact: true, spaces: 2 }));
    const productList = json.nfeProc.NFe.infNFe.det;

    if (productList && productList.length && productList.length > 0) {
      for (const product of productList) {
        invoices.push({
          codigo: product.prod.cProd._text,
          descricao: product.prod.xProd._text,
          quantidade: product.prod.qCom._text,
        });
      }
    } else if (productList) {
      invoices.push({
        codigo: productList.prod.cProd._text,
        descricao: productList.prod.xProd._text,
        quantidade: productList.prod.qCom._text,
      });
    }

    return invoices;
  }

  private async fetch(parameters: FetchParametersInterface): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${parameters.url}`, {
          params: {
            apikey: this.authToken,
            ...parameters.parameters,
          },
        }),
      );

      return data;
    } catch (error) {
      console.error(`Error during HTTP request: ${error}`);
      throw error;
    }
  }
}
