import { PaginatedDTO } from '@app/common/database/model/dto/paginatedDTO.interface';
import { SaleDTO } from '@app/common/database/model/dto/saleDTO';
import { Sale } from '@app/common/database/model/entity/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  Raw,
  Repository,
} from 'typeorm';

interface GetSalesPayloadInterface {
  companyId: number;
  startDate: Date;
  endDate: Date;
  marketplace?: string;
  sort?: string;
  size?: number;
  page?: number;
}

export class GetSalesUseCase {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  async execute(
    payload: GetSalesPayloadInterface,
  ): Promise<PaginatedDTO<SaleDTO>> {
    const [sales, totalElements] = await this.saleRepository.findAndCount({
      where: this.getWhereByParams(payload),
      order: payload.sort ? this.getSortingByParams(payload.sort) : undefined,
      take: payload.size ? payload.size : 10,
      skip: payload.page && payload.page != 1 ? payload.page * payload.size : 1,
      relations: {
        products: {
          product: true,
        },
      },
    });

    return {
      totalElements,
      content: sales.map((sale) => new SaleDTO(sale)),
    };
  }

  getWhereByParams(payload: GetSalesPayloadInterface): FindOptionsWhere<Sale> {
    const whereObject: FindOptionsWhere<Sale> = {
      company: {
        id: payload.companyId,
      },
    };

    if (payload.startDate && payload.endDate) {
      whereObject.date = Between(payload.startDate, payload.endDate);
    }

    if (payload.marketplace) {
      whereObject.marketplace = Raw(
        (marketplace) => `LOWER(${marketplace}) LIKE LOWER(:value)`,
        {
          value: `%${payload.marketplace}%`,
        },
      );
    }

    return whereObject;
  }

  getSortingByParams(sort: string): FindOptionsOrder<Sale> {
    const sorted = sort.split(',');

    return {
      [sorted[0]]: sorted[1],
    };
  }
}
