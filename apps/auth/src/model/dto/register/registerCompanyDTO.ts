// import { Integration } from '@app/common/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterCompanyDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  // @IsNotEmpty()
  // integrationKey: string;

  // @IsNotEmpty()
  // integrationType: Integration;
}
