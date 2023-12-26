import { Company } from '@app/common/database';
import {
  Integration,
  IntegrationProvider,
  IntegrationStatus,
} from '@app/common/database/model/entity/integration.entity';
import { BaseUseCase } from '@app/common/utils/baseUseCase';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuid } from 'uuidv4';

export class GenerateMercadolivreAuthUrlUseCase extends BaseUseCase {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {
    super();
  }

  async execute(company: Company): Promise<string> {
    const integration = await this.createIntegration(company);
    const base64Id = btoa(integration.id.toString());

    const state = `integration-${base64Id}verifier-${integration.verificationState}`;

    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${process.env.MERCADOLIVRE_APPID}&redirect_uri=${process.env.MERCADOLIVRE_REDIRECT_URL}&state=${state}`;
  }

  private async createIntegration(company: Company): Promise<Integration> {
    const integration = new Integration();

    integration.company = company;
    integration.integrationProvider = IntegrationProvider.MERCADOLIVRE;
    integration.status = IntegrationStatus.PENDING_ACTIVATION;
    integration.verificationState = uuid();

    return await this.integrationRepository.save(integration);
  }
}
