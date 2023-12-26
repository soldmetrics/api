import { Sale } from '@app/common/database/model/entity/sale.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { LessThan, Repository } from 'typeorm';

Injectable();
export class CleanSalesProcessor {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
  ) {}

  async execute(): Promise<number> {
    try {
      console.log('Cleaning old sales');

      const result = await this.saleRepository.delete({
        date: LessThan(moment().subtract(90, 'days').toDate()),
      });

      console.log(`deleted ${result.affected} records of sales`);

      return result.affected;
    } catch (error) {
      console.error(`error on sales clean: ${error}`);
    }
  }
}
