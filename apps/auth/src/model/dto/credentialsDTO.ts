import { IsEmail, IsNotEmpty } from 'class-validator';

export class CredentialsDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
