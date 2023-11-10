import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  planId: number;

  @ApiProperty()
  @IsNotEmpty()
  startDate: Date;
}
