// import { Integration } from '@app/common/database';
import { IsNotEmpty } from 'class-validator';

export class RegisterCompanyDto {
  @IsNotEmpty()
  name: string;

  // @IsNotEmpty()
  // integrationKey: string;

  // @IsNotEmpty()
  // integrationType: Integration;
}
