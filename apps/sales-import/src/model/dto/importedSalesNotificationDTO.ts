import { Company } from '@app/common/database';
import { Sale } from '@app/common/database/model/entity/sale.entity';

export interface ImportedSalesNotificationDTO {
  company: Company;
  sales: Sale[];
}
