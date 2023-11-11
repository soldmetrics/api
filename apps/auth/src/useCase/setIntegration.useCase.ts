import { Company, Integration } from '@app/common/database';
import { BaseUseCase, RollbackTypeEnum } from '@app/common/utils/baseUseCase';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetIntegrationDTO } from '../model/dto/setIntegrationDTO';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { ClientProxy } from '@nestjs/microservices';
import { SALES_IMPORT_SERVICE } from '@app/common/config/constants';
import { lastValueFrom } from 'rxjs';

Injectable();
export class SetIntegrationUseCase extends BaseUseCase {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(SALES_IMPORT_SERVICE) private salesImportClient: ClientProxy,
  ) {
    super();
  }

  async execute(
    payload: SetIntegrationDTO,
    company: Company,
    authToken: string,
  ): Promise<boolean> {
    try {
      const { integration, token } = payload;

      if (!Object.values(Integration).includes(integration)) {
        throw new BadRequestException('Integration provided not supported');
      }

      const newCompany: Company = Object.assign({}, company);
      newCompany.getExternalRepository =
        company.getExternalRepository.bind(newCompany);
      newCompany.integration = integration;
      newCompany.integrationKey = token;

      await this.testIntegration(newCompany);
      this.rollbackStack.push({
        object: company,
        repository: this.companyRepository,
        type: RollbackTypeEnum.UPDATE,
      });

      company.integration = integration;
      company.integrationKey = token;

      await this.companyRepository.save(company);

      await lastValueFrom(
        this.salesImportClient.emit('apiKey_updated', {
          company,
          Authentication: authToken,
        }),
      );

      return true;
    } catch (error) {
      await this.rollback();

      throw new BadRequestException(
        'Could not validate integration key',
        JSON.stringify(error),
      );
    }
  }

  private async testIntegration(company: Company): Promise<void> {
    try {
      const today = moment().subtract(3, 'hours').format('DD/MM/yyyy');
      const lastMonth = moment().subtract(30, 'days').format('DD/MM/yyyy');
      const repository = company.getExternalRepository(this.httpService);
      console.log(repository.authToken);

      const sales = await repository.getSales(1, lastMonth, today);

      if (!sales) {
        throw new BadRequestException('Could not validate Api Key');
      }
    } catch (error) {
      console.log(`Error during validation of the provided API Key ${error}`);
      throw new BadRequestException(
        'Error during validation of the provided API Key',
      );
    }
  }
}
