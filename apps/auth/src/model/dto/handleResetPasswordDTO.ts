import { IsNotEmpty } from 'class-validator';

export class HandleResetPasswordDTO {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  passwordConfirmation: string;
}
