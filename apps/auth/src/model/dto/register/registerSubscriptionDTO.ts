import { IsNotEmpty } from 'class-validator';

export class RegisterSubscriptionDto {
  @IsNotEmpty()
  planId: number;

  @IsNotEmpty()
  startDate: Date;
}
