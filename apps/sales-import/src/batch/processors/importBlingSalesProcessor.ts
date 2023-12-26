// import { AUTH_SERVICE } from '@app/common/config/constants';
// import { Company, Integration } from '@app/common/database';
// import { ImportedSaleDTO } from '@app/common/database/model/dto/importedSaleDTO.interface';
// import {
//   JobExecution,
//   JobNameEnum,
// } from '@app/common/database/model/entity/jobExecution.entity';
// import { Product } from '@app/common/database/model/entity/product.entity';
// import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
// import { Sale, SaleType } from '@app/common/database/model/entity/sale.entity';
// import { HttpService } from '@nestjs/axios';
// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { InjectRepository } from '@nestjs/typeorm';
// import * as moment from 'moment';
// import { lastValueFrom } from 'rxjs';
// import { Between, In, Not, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';

Injectable();
export class ImportBlingSalesProcessor {
  //   private readonly logger = new Logger(ImportBlingSalesProcessor.name);
  //   constructor(
  //     private httpService: HttpService,
  //     @InjectRepository(ProductSale)
  //     private productSaleRepository: Repository<ProductSale>,
  //     @InjectRepository(Company) private companyRepository: Repository<Company>,
  //     @InjectRepository(Sale) private saleRepository: Repository<Sale>,
  //     @InjectRepository(Product) private productRepository: Repository<Product>,
  //     @InjectRepository(JobExecution)
  //     private jobExecutionRepository: Repository<JobExecution>,
  //     @Inject(AUTH_SERVICE) private authClient: ClientProxy,
  //   ) {}
  //   async execute() {
  //     this.logger.log('Starting sales import from Bling API');
  //     const companies = await this.fetchAllCompanies();
  //     for (const company of companies) {
  //       try {
  //         this.logger.log(`Starting sales import for company ${company.name}`);
  //         const { importedSales, page } = await this.importSales(company);
  //         const sales: Sale[] = [];
  //         this.logger.log(`Found ${importedSales.length} sales for company`);
  //         for (const importedSale of importedSales) {
  //           try {
  //             const existingProducts = await this.productRepository.findBy({
  //               company: {
  //                 id: company.id,
  //               },
  //               code: In(importedSale.itens.map((e) => e.codigo)),
  //             });
  //             let sale = new Sale(
  //               importedSale.numero,
  //               importedSale.data,
  //               importedSale.cliente.nome,
  //               SaleType.PEDIDO,
  //               company,
  //               importedSale.marketplace,
  //             );
  //             sale = await this.saleRepository.save(sale);
  //             sales.push(sale);
  //             const productSales = importedSale.itens.map((item) => {
  //               let product = existingProducts.find((e) => e.code == item.codigo);
  //               if (!product) {
  //                 product = new Product(
  //                   item.codigo,
  //                   item.descricao,
  //                   item.valorunidade || 0,
  //                   item.precocusto || 0,
  //                   0,
  //                   false,
  //                   '',
  //                   company,
  //                   '',
  //                 );
  //               }
  //               return new ProductSale(product, sale, parseInt(item.quantidade));
  //             });
  //             await this.productSaleRepository.save(productSales);
  //           } catch (error) {
  //             this.logger.error(
  //               `Error when trying to import sale number ${importedSale.numero}:, \n ${error}`,
  //             );
  //           }
  //         }
  //         await this.updateLastJobExecution(page, company);
  //         await this.enqueueNotifications(company, sales);
  //       } catch (error) {
  //         this.logger.error(
  //           `Error when trying to import sales for company ${company.name}`,
  //         );
  //         this.logger.error(error);
  //       }
  //     }
  //     this.logger.log('Importation finished!');
  //   }
  //   private async importSales(company: Company) {
  //     const importedSales: ImportedSaleDTO[] = [];
  //     let lastPage = false;
  //     let page: number = 1;
  //     const companySaleNumbers = await this.getAllSaleNumbersOfToday(company);
  //     const lastJob = await this.fetchLastJobFromCompany(company);
  //     const externalRepository = company.getExternalRepository(this.httpService);
  //     if (lastJob) {
  //       page = lastJob.lastPage || 1;
  //     }
  //     while (!lastPage) {
  //       const today = moment().subtract(3, 'hours').format('DD/MM/yyyy');
  //       const fetchedSales = await externalRepository.getSales(
  //         page,
  //         today,
  //         today,
  //       );
  //       importedSales.push(
  //         ...fetchedSales.filter(
  //           (sale) => !companySaleNumbers.includes(sale.numero),
  //         ),
  //       );
  //       lastPage = fetchedSales.length < 100;
  //       if (!lastPage) {
  //         page++;
  //       }
  //     }
  //     return { importedSales, page };
  //   }
  //   private async getAllSaleNumbersOfToday(company: Company): Promise<string[]> {
  //     const saleNumbers = await this.saleRepository.find({
  //       where: {
  //         company: {
  //           id: company.id,
  //         },
  //         saleType: SaleType.PEDIDO,
  //         date: Between(
  //           moment().subtract(3, 'hours').startOf('day').toDate(),
  //           moment().subtract(3, 'hours').endOf('day').toDate(),
  //         ),
  //       },
  //       select: ['number'],
  //     });
  //     return saleNumbers.map((e) => e.number);
  //   }
  //   private async updateLastJobExecution(
  //     page: number,
  //     company: Company,
  //   ): Promise<void> {
  //     try {
  //       this.logger.log(`Updating job execution with last page of ${page}`);
  //       await this.jobExecutionRepository.delete({
  //         company: {
  //           id: company.id,
  //         },
  //         jobName: JobNameEnum.IMPORT_BLING_SALES,
  //       });
  //       const jobExecution = new JobExecution();
  //       jobExecution.company = company;
  //       jobExecution.jobName = JobNameEnum.IMPORT_BLING_SALES;
  //       jobExecution.lastPage = page;
  //       await this.jobExecutionRepository.save(jobExecution);
  //     } catch (error) {
  //       this.logger.error(
  //         `Error when trying to update job execution: \n ${error}`,
  //       );
  //     }
  //   }
  //   private async enqueueNotifications(
  //     company: Company,
  //     sales: Sale[],
  //   ): Promise<void> {
  //     if (sales.length == 0) {
  //       return;
  //     }
  //     this.logger.log(
  //       `Enqueing ${sales.length} notifications for company ${company.name}`,
  //     );
  //     await lastValueFrom(
  //       this.authClient.emit('imported_sales', {
  //         company,
  //         sales,
  //       }),
  //     );
  //   }
  //   private async fetchAllCompanies(): Promise<Company[]> {
  //     return this.companyRepository.find({
  //       where: { integrationKey: Not(''), integration: Integration.BLING },
  //     });
  //   }
  //   private async fetchLastJobFromCompany(
  //     company: Company,
  //   ): Promise<JobExecution | null> {
  //     return this.jobExecutionRepository.findOne({
  //       where: {
  //         company: {
  //           id: company.id,
  //         },
  //         jobName: JobNameEnum.IMPORT_BLING_SALES,
  //         createdAt: Between(
  //           moment().subtract(3, 'hours').startOf('day').toDate(),
  //           moment().subtract(3, 'hours').endOf('day').toDate(),
  //         ),
  //       },
  //       order: {
  //         createdAt: 'DESC',
  //       },
  //     });
  //   }
}
