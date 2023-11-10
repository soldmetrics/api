import { IsNotEmpty } from 'class-validator';
import { RegisterCompanyDto } from './registerCompanyDTO';
import { RegisterSubscriptionDto } from './registerSubscriptionDTO';
import { RegisterUserDto } from './registerUserDTO';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  user: RegisterUserDto;

  @ApiProperty()
  company: RegisterCompanyDto;

  @ApiProperty()
  subscription?: RegisterSubscriptionDto;
}
