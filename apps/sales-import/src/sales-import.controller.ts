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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sales Import')
@Controller()
export class SalesImportController {
  constructor(private readonly receiveSaleUseCase: ReceiveSalesUseCase) {}

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
}
