import { Controller, Post, Request } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('receive-sale')
  receiveSale(@Request() request): string {
    return this.salesService.getHello();
  }
}
