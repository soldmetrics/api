import { Company, Integration } from '@app/common/database';
import { ImportedInvoiceDTO } from '@app/common/database/model/dto/importedSaleDTO.interface';
import {
  JobExecution,
  JobNameEnum,
} from '@app/common/database/model/entity/jobExecution.entity';
import { Product } from '@app/common/database/model/entity/product.entity';
import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
import { Sale, SaleType } from '@app/common/database/model/entity/sale.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Between, In, Not, Repository } from 'typeorm';

Injectable();
export class ImportBlingInvoicesProcessor {
  private readonly logger = new Logger(ImportBlingInvoicesProcessor.name);

  constructor(
    private httpService: HttpService,
    @InjectRepository(ProductSale)
    private productSaleRepository: Repository<ProductSale>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(Sale) private saleRepository: Repository<Sale>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(JobExecution)
    private jobExecutionRepository: Repository<JobExecution>,
  ) {}

  async execute() {
    this.logger.log('Starting invoices import from Bling API');

    const companies = await this.fetchAllCompanies();

    for (const company of companies) {
      this.logger.log(`Starting invoices import for company ${company.name}`);
      const { importedInvoices, page } = await this.importInvoices(company);

      this.logger.log(`Found ${importedInvoices.length} invoices for company`);

      for (const importedSale of importedInvoices) {
        try {
          const existingProducts = await this.productRepository.findBy({
            company: {
              id: company.id,
            },
            code: In(importedSale.itens.map((e) => e.codigo)),
          });

          let sale = new Sale(
            importedSale.numero,
            importedSale.data,
            importedSale.cliente.nome,
            SaleType.NOTA,
            company,
            importedSale.marketplace,
          );

          sale = await this.saleRepository.save(sale);

          const productSales = importedSale.itens.map((item) => {
            let product = existingProducts.find((e) => e.code == item.codigo);

            if (!product) {
              product = new Product(
                item.codigo,
                item.descricao,
                item.valorunidade || 0,
                item.precocusto || 0,
                0,
                false,
                '',
                company,
                '',
              );
            }

            return new ProductSale(product, sale, parseInt(item.quantidade));
          });

          await this.productSaleRepository.save(productSales);
        } catch (error) {
          this.logger.error(
            `Error when trying to import sale number ${importedSale.numero}:, \n ${error}`,
          );
        }
      }

      await this.updateLastJobExecution(page, company);
    }

    this.logger.log('Importation finished!');
  }

  private async importInvoices(company: Company) {
    const importedInvoices: ImportedInvoiceDTO[] = [];
    let lastPage = false;
    let page: number = 1;

    const companySaleNumbers = await this.getAllSaleNumbersOfToday(company);
    const lastJob = await this.fetchLastJobFromCompany(company);
    const externalRepository = company.getExternalRepository(this.httpService);

    if (lastJob) {
      page = lastJob.lastPage || 1;
    }

    while (!lastPage) {
      const today = moment().subtract(3, 'hours').format('DD/MM/yyyy');

      const { result: fetchedInvoices } = await externalRepository.getInvoices(
        page,
        today,
        today,
        companySaleNumbers,
      );

      importedInvoices.push(
        ...fetchedInvoices.filter(
          (sale) => !companySaleNumbers.includes(sale.numero),
        ),
      );

      lastPage = fetchedInvoices.length < 100;
      if (!lastPage) {
        page++;
      }
    }

    return { importedInvoices, page };
  }

  private async getAllSaleNumbersOfToday(company: Company): Promise<string[]> {
    const saleNumbers = await this.saleRepository.find({
      where: {
        company: {
          id: company.id,
        },
        saleType: SaleType.NOTA,
        date: Between(
          moment().subtract(3, 'hours').startOf('day').toDate(),
          moment().subtract(3, 'hours').endOf('day').toDate(),
        ),
      },
      select: ['number'],
    });

    return saleNumbers.map((e) => e.number);
  }

  private async updateLastJobExecution(
    page: number,
    company: Company,
  ): Promise<void> {
    try {
      this.logger.log(`Updating job execution with last page of ${page}`);
      await this.jobExecutionRepository.delete({
        company: {
          id: company.id,
        },
        jobName: JobNameEnum.IMPORT_BLING_INVOICES,
      });

      const jobExecution = new JobExecution();

      jobExecution.company = company;
      jobExecution.jobName = JobNameEnum.IMPORT_BLING_INVOICES;
      jobExecution.lastPage = page;

      await this.jobExecutionRepository.save(jobExecution);
    } catch (error) {
      this.logger.error(
        `Error when trying to update job execution: \n ${error}`,
      );
    }
  }

  private async fetchAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find({
      where: { integrationKey: Not(''), integration: Integration.BLING },
    });
  }

  private async fetchLastJobFromCompany(
    company: Company,
  ): Promise<JobExecution | null> {
    return this.jobExecutionRepository.findOne({
      where: {
        company: {
          id: company.id,
        },
        jobName: JobNameEnum.IMPORT_BLING_INVOICES,
        createdAt: Between(
          moment().subtract(3, 'hours').startOf('day').toDate(),
          moment().subtract(3, 'hours').endOf('day').toDate(),
        ),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
