// import { HttpService } from '@nestjs/axios';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as moment from 'moment';
// import { BaseUseCase } from '@app/common/utils/baseUseCase';
// import { Company } from '@app/common/database';
// import { ReceiveSaleDataTiny } from '../model/dto/ReceiveSaleDTO';
// import { Product } from '@app/common/database/model/entity/product.entity';
// import { Sale, SaleType } from '@app/common/database/model/entity/sale.entity';
// import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
// import { InternalServerErrorException } from '@nestjs/common';

import { BaseUseCase } from '@app/common/utils/baseUseCase';

export class ReceiveSalesUseCase extends BaseUseCase {
  //   constructor(
  //     private httpService: HttpService,
  //     @InjectRepository(Company)
  //     private companyRepository: Repository<Company>,
  //     @InjectRepository(Sale)
  //     private saleRepository: Repository<Sale>,
  //     @InjectRepository(ProductSale)
  //     private productSaleRepository: Repository<ProductSale>,
  //   ) {
  //     super();
  //   }
  //   async execute(data: ReceiveSaleDataTiny, companyId: number): Promise<void> {
  //     const company = await this.companyRepository.findOne({
  //       where: {
  //         id: 1,
  //       },
  //     });
  //     try {
  //       if (this.checkSaleExistance(data.numero, companyId)) {
  //         await this.importSale(data, company);
  //       } else {
  //         console.log(
  //           `sale ${data.numero} was already imported, no need to update dates`,
  //         );
  //       }
  //     } catch (error) {
  //       console.log(
  //         `Error during import sales for company ${company.name}, error: \n${error}`,
  //       );
  //       throw new InternalServerErrorException(
  //         'Unexpected error when importing sale',
  //       );
  //     }
  //   }
  //   private async checkSaleExistance(
  //     number: string,
  //     companyId: number,
  //   ): Promise<boolean> {
  //     const saleExists =
  //       (await this.saleRepository.countBy({
  //         number,
  //         saleType: SaleType.PEDIDO,
  //         company: {
  //           id: companyId,
  //         },
  //       })) > 0;
  //     return saleExists;
  //   }
  //   private async importSale(
  //     data: ReceiveSaleDataTiny,
  //     company: Company,
  //   ): Promise<void> {
  //     const tinyRepository = company.getExternalRepository(this.httpService);
  //     const saleInfo = await tinyRepository.getSaleInformation(data.id);
  //     let sale = new Sale(
  //       saleInfo.numero,
  //       moment(saleInfo.data_pedido, 'DD/MM/yyyy').add(3, 'hours').toDate(),
  //       saleInfo.cliente.nome,
  //       SaleType.PEDIDO,
  //       company,
  //       saleInfo?.ecommerce?.nomeEcommerce,
  //     );
  //     sale = await this.saleRepository.save(sale);
  //     const productSales: ProductSale[] = saleInfo.itens.map((itemData) => {
  //       const { item } = itemData;
  //       return new ProductSale(
  //         new Product(
  //           item.codigo,
  //           item.descricao,
  //           item.valor_unitario,
  //           0,
  //           0,
  //           false,
  //           '',
  //           company,
  //           item.id_produto,
  //         ),
  //         sale,
  //         item.quantidade,
  //       );
  //     });
  //     await this.productSaleRepository.save(productSales);
  //   }
}
