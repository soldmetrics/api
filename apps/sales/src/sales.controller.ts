import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '@app/common/config/roles.decorator';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { GetSalesUseCase } from './useCase/getSales.useCase';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sales')
@Controller()
export class SalesController {
  constructor(
    private getUserCompanyUseCase: GetUserAndCompanyUseCase,
    private getSalesUseCase: GetSalesUseCase,
  ) {}

  @Get()
  @Roles('ROLE_USER', 'ROLE_COMPANY_MANAGER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async receiveSale(
    @Request() req,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('companyId') companyId?: number,
    @Query('marketplace') marketplace?: string,
    @Query('sort') sort?: string,
    @Query('size') size?: number,
    @Query('page') page?: number,
  ) {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate!');
    }
    const user = await this.getUserCompanyUseCase.execute(req.user.userId);

    const isAdmin = user.roles.map((e) => e.name).includes('ROLE_ADMIN');

    if (companyId && user.company.id !== companyId && !isAdmin) {
      throw new ForbiddenException();
    }

    return this.getSalesUseCase.execute({
      companyId: companyId || user.company.id,
      endDate,
      startDate,
      marketplace,
      page,
      size,
      sort,
    });
  }
}
