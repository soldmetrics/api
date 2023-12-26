/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReceiveSaleTinyDTO } from './model/dto/ReceiveSaleDTO';
import { ReceiveSalesUseCase } from './useCase/receiveSale.useCase';
import { ApiTags } from '@nestjs/swagger';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ImportLastMonthUseCase } from './useCase/importLastMonth.useCase';
import { Roles } from '@app/common/config/roles.decorator';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { GenerateMercadolivreAuthUrlUseCase } from './useCase/generateMercadolivreAuthURL.useCase';
import { SetMercadolivreIntegrationUseCase } from './useCase/setMercadolivreIntegration.useCase';

@ApiTags('Sales Import')
@Controller()
export class IntegrationsController {
  constructor(
    private readonly receiveSaleUseCase: ReceiveSalesUseCase,
    private importLastMonthUseCase: ImportLastMonthUseCase,
    private getUserCompanyUseCase: GetUserAndCompanyUseCase,
    private generateMercadolivreAuthURL: GenerateMercadolivreAuthUrlUseCase,
    private setMercadolivreIntegrationUseCase: SetMercadolivreIntegrationUseCase,
  ) {}

  @Post('tiny/receive-sale/:companyId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async receiveSale(
    @Body() receiveSaleDTO: ReceiveSaleTinyDTO,
    @Param('companyId') companyId: number,
  ) {
    console.log('receive sales input:');
    console.log(JSON.stringify(receiveSaleDTO));

    // await this.receiveSaleUseCase.execute(receiveSaleDTO.dados, companyId);

    return HttpStatus.OK;
  }

  @Get('mercadolivre/get-auth-url')
  @Roles('ROLE_USER', 'ROLE_COMPANY_MANAGER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMercadolivreAuthURL(@Request() req): Promise<string> {
    const user = await this.getUserCompanyUseCase.execute(req.user.userId);

    return await this.generateMercadolivreAuthURL.execute(user.company);
  }

  @Get('mercadolivre/set-integration')
  @UsePipes(new ValidationPipe({ transform: true }))
  async setMercadolivreIntegration(
    @Request() req,
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<string> {
    return await this.setMercadolivreIntegrationUseCase.execute(code, state);
  }

  @EventPattern('apiKey_updated')
  async handleApiKeyUpdated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      console.log('received apiKey updated event');
      return await this.importLastMonthUseCase.execute(data.company.id);
    } catch (error) {
      console.log('Error when importing sales from lastMonth');
      console.log('data: ', data);
      console.log('error: ', error);
    } finally {
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();

      channel.ack(originalMsg);
    }
  }
}
