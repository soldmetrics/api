import { Integration } from '@app/common/database';
import { IsNotEmpty } from 'class-validator';

export class SetIntegrationDTO {
  @IsNotEmpty()
  integration: Integration;

  @IsNotEmpty()
  token: string;
}
