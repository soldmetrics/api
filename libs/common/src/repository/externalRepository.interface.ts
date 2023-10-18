import { HttpService } from '@nestjs/axios';
import { ExternalProduct } from '../database/model/dto/externalProduct.interface';
import {
  ImportedInvoiceDTO,
  ImportedSaleDTO,
} from '../database/model/dto/importedSaleDTO.interface';

export interface FetchParametersInterface {
  url: string;
  parameters: { [key: string]: any };
}

export interface ExternalRepository {
  httpService: HttpService;
  baseUrl: string;
  authToken: string;

  getProducts(page: number): Promise<ExternalProduct[]>;

  getSales(
    page: number,
    startDate: string,
    endDate: string,
  ): Promise<ImportedSaleDTO[]>;

  getInvoices(
    page: number,
    startDate: string,
    endDate: string,
    createdSaleNumbers?: string[],
  ): Promise<{ result: ImportedInvoiceDTO[]; errorQtd: number }>;

  getSaleInformation(id: string): Promise<any>;
}
