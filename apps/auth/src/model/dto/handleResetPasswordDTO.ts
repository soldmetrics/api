import { IsNotEmpty } from 'class-validator';

export class HandleResetPasswordDTO {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  passwordConfirmation: string;
}
