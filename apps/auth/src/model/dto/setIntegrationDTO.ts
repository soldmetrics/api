import { IntegrationProvider } from '@app/common/database/model/entity/integration.entity';
import { IsNotEmpty } from 'class-validator';

export class SetIntegrationDTO {
  @IsNotEmpty()
  integration: IntegrationProvider;

  @IsNotEmpty()
  token: string;
}
