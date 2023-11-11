/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReceiveSaleTinyDTO } from './model/dto/ReceiveSaleDTO';
import { ReceiveSalesUseCase } from './useCase/receiveSale.useCase';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Company } from '@app/common/database';
import { ImportLastMonthUseCase } from './useCase/importLastMonth.useCase';

@Controller()
export class SalesImportController {
  constructor(
    private readonly receiveSaleUseCase: ReceiveSalesUseCase,
    private importLastMonthUseCase: ImportLastMonthUseCase,
  ) {}

  @Post('tiny/receive-sale/:companyId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async receiveSale(
    @Body() receiveSaleDTO: ReceiveSaleTinyDTO,
    @Param('companyId') companyId: number,
  ) {
    console.log('receive sales input:');
    console.log(JSON.stringify(receiveSaleDTO));

    await this.receiveSaleUseCase.execute(receiveSaleDTO.dados, companyId);

    return HttpStatus.OK;
  }

  @EventPattern('apiKey_updated')
  // @UseGuards(JwtAuthGuard)
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
