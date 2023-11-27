import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import { ApiTags } from '@nestjs/swagger';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { SetIntegrationDTO } from './model/dto/setIntegrationDTO';
import {
  SetIntegrationResponse,
  SetIntegrationUseCase,
} from './useCase/setIntegration.useCase';
import {
  RegisterDevicePayload,
  RegisterDeviceUseCase,
} from './useCase/registerDevice.useCase';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private canResetPasswordUseCase: CanResetPasswordUseCase,
    private handleResetPasswordUseCase: HandleResetPasswordUseCase,
    private getUserAndCompanyUseCase: GetUserAndCompanyUseCase,
    private setIntegrationUseCase: SetIntegrationUseCase,
    private registerDeviceUseCase: RegisterDeviceUseCase,
  ) {}

  @Get('/me')
  @UsePipes(new ValidationPipe({ transform: true }))
  async me(@Request() req) {
    return await this.getUserAndCompanyUseCase.execute(req.user.userId);
  }

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
  async canResetPassword(
    @Query('token') token: string,
    @Query('code') code: string,
  ) {
    return await this.canResetPasswordUseCase.execute(token, code);
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

  @Post('/set-integration')
  @HttpCode(200)
  async setIntegration(
    @Req() req,
    @Body() setIntegrationDTO: SetIntegrationDTO,
  ): Promise<SetIntegrationResponse> {
    const user = await this.getUserAndCompanyUseCase.execute(req.user.userId);

    return this.setIntegrationUseCase.execute(
      setIntegrationDTO,
      user.company,
      req.headers.authorization,
    );
  }

  @Post('/register-device')
  @HttpCode(200)
  async registerDevice(
    @Req() req,
    @Body() registerDeviceDTO: RegisterDevicePayload,
  ) {
    return this.registerDeviceUseCase.execute(
      registerDeviceDTO,
      req.user.userId,
    );
  }
}
