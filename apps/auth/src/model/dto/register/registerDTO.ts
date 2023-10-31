import { IsNotEmpty } from 'class-validator';
import { RegisterCompanyDto } from './registerCompanyDTO';
import { RegisterSubscriptionDto } from './registerSubscriptionDTO';
import { RegisterUserDto } from './registerUserDTO';

export class RegisterDto {
  @IsNotEmpty()
  user: RegisterUserDto;
  company: RegisterCompanyDto;
  subscription?: RegisterSubscriptionDto;
}
