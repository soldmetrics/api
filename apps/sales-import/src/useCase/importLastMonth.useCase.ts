import { Company } from '@app/common/database';
import { ImportedSaleDTO } from '@app/common/database/model/dto/importedSaleDTO.interface';
import { Product } from '@app/common/database/model/entity/product.entity';
import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
import { Sale, SaleType } from '@app/common/database/model/entity/sale.entity';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { In, Repository } from 'typeorm';

export class ImportLastMonthUseCase extends BaseUseCase {
  private readonly logger = new Logger(ImportLastMonthUseCase.name);

  constructor(
    private httpService: HttpService,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(ProductSale)
    private productSaleRepository: Repository<ProductSale>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {
    super();
  }

  async execute(companyId: number): Promise<void> {
    const company = await this.companyRepository.findOneBy({ id: companyId });

    this.logger.log(
      `Starting sales import of last month for company ${company.name}`,
    );

    await this.deleteSalesFromCompany(company.id);

    const importedSales = await this.importSales(company);

    for (const importedSale of importedSales) {
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
          SaleType.PEDIDO,
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

    this.logger.log('Importation finished!');
  }

  private async deleteSalesFromCompany(companyId): Promise<void> {
    await this.saleRepository.delete({ company: { id: companyId } });
  }

  private async importSales(company: Company): Promise<ImportedSaleDTO[]> {
    const importedSales: ImportedSaleDTO[] = [];
    const externalRepository = company.getExternalRepository(this.httpService);
    const today = moment().subtract(3, 'hours').format('DD/MM/yyyy');
    const lastMonth = moment().subtract(30, 'days').format('DD/MM/yyyy');
    let lastPage = false;
    let page: number = 1;

    while (!lastPage) {
      const fetchedSales = await externalRepository.getSales(
        page,
        lastMonth,
        today,
      );

      importedSales.push(...fetchedSales);

      lastPage = fetchedSales.length < 100;
      if (!lastPage) {
        page++;
      }
    }

    return importedSales;
  }
}
