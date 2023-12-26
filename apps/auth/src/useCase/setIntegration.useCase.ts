import { Company } from '@app/common/database';
import { BaseUseCase, RollbackTypeEnum } from '@app/common/utils/baseUseCase';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetIntegrationDTO } from '../model/dto/setIntegrationDTO';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { INTEGRATIONS_SERVICE } from '@app/common/config/constants';
import { lastValueFrom } from 'rxjs';
import { IntegrationProvider } from '@app/common/database/model/entity/integration.entity';

export interface SetIntegrationResponse {
  success: boolean;
  message: string;
  callbackUrl?: string;
}

Injectable();
export class SetIntegrationUseCase extends BaseUseCase {
  constructor(
    private httpService: HttpService,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(INTEGRATIONS_SERVICE) private integrationsClient: ClientProxy,
  ) {
    super();
  }

  async execute(
    payload: SetIntegrationDTO,
    company: Company,
    authToken: string,
  ): Promise<SetIntegrationResponse> {
    try {
      const { integration } = payload;

      if (!Object.values(IntegrationProvider).includes(integration)) {
        throw new BadRequestException('Integration provided not supported');
      }

      // const newCompany: Company = Object.assign({}, company);
      // newCompany.getExternalRepository =
      //   company.getExternalRepository.bind(newCompany);
      // newCompany.integration = integration;
      // newCompany.integrationKey = token;

      // await this.testIntegration(newCompany);
      this.rollbackStack.push({
        object: company,
        repository: this.companyRepository,
        type: RollbackTypeEnum.UPDATE,
      });

      // company.integration = integration;
      // company.integrationKey = token;

      await this.companyRepository.save(company);

      await lastValueFrom(
        this.integrationsClient.emit('apiKey_updated', {
          company,
          Authentication: authToken,
        }),
      );

      const response: SetIntegrationResponse = {
        success: true,
        message:
          'Chave de integração salva com sucesso. Aguarde a importação de vendas',
      };

      if (integration === IntegrationProvider.TINY) {
        response.callbackUrl = `${process.env.APP_URL}/integrations/tiny/receive-sale/${company.id}`;
      }

      return response;
    } catch (error) {
      await this.rollback();

      throw new BadRequestException(
        'Could not validate integration key',
        JSON.stringify(error),
      );
    }
  }

  // private async testIntegration(company: Company): Promise<void> {
  //   try {
  //     const today = moment().subtract(3, 'hours').format('DD/MM/yyyy');
  //     const lastMonth = moment().subtract(30, 'days').format('DD/MM/yyyy');
  //     const repository = company.getExternalRepository(this.httpService);
  //     console.log(repository.authToken);

  //     const sales = await repository.getSales(1, lastMonth, today);

  //     if (!sales) {
  //       throw new BadRequestException('Could not validate Api Key');
  //     }
  //   } catch (error) {
  //     console.log(`Error during validation of the provided API Key ${error}`);
  //     throw new BadRequestException(
  //       'Error during validation of the provided API Key',
  //     );
  //   }
  // }
}
