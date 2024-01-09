/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Response,
  Request,
} from '@nestjs/common';
import { BillingUseCase } from './useCase';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BillingDTO {
  @IsNotEmpty()
  priceId: string;
  @IsNotEmpty()
  urlSuccess: string;
  @IsNotEmpty()
  urlCancel: string;
}

@ApiTags('Billing')
@Controller()
export class BillingController {
  constructor(private billingUseCase: BillingUseCase) {}

  @Post('')
  async billing(@Req() req: Request, @Body() body: BillingDTO) {
    // @ts-ignore
    return await this.billingUseCase.execute(req.user.userId, body);
  }

  @Get('redirect')
  async success(@Res() res: Response, @Query('url') url: string) {
    // @ts-ignore
    return res.status(302).redirect(url);
  }

  @Post('webhook')
  async webhook(@Req() req) {
    const sig = req.headers['stripe-signature'];

    // @ts-ignore
    return await this.billingUseCase.webhook(sig, req.rawBody);
  }
}
