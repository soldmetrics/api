import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CredentialsDTO } from './model/dto/credentialsDTO';
import {
  CanResetPasswordUseCase,
  HandleResetPasswordUseCase,
  LoginUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
} from './useCase';
import { HandleResetPasswordDTO } from './model/dto/handleResetPasswordDTO';
import { RegisterDto } from './model/dto/register/registerDTO';

@Controller()
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private canResetPasswordUseCase: CanResetPasswordUseCase,
    private handleResetPasswordUseCase: HandleResetPasswordUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() credentialsDto: CredentialsDTO) {
    return await this.loginUseCase.execute(credentialsDto);
  }

  @Post('/reset-password')
  @HttpCode(200)
  async resetPassword(@Query('email') email: string) {
    return await this.resetPasswordUseCase.execute(email);
  }

  @Get('/reset-password/enabled')
  @HttpCode(200)
  async canResetPassword(@Query('token') token: string) {
    return await this.canResetPasswordUseCase.execute(token);
  }

  @Post('/reset-password/handle')
  @HttpCode(200)
  async handleResetPassword(@Body() resetPasswordDto: HandleResetPasswordDTO) {
    return await this.handleResetPasswordUseCase.execute(resetPasswordDto);
  }

  @Get('/validateToken')
  @HttpCode(200)
  async validateToken() {
    // If the request reached here, the token will be always valid
    return 'Valid token!';
  }
}
