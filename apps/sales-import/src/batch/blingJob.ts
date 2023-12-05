import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanSalesProcessor } from './processors/cleanSalesProcessor';
import { ImportBlingSalesProcessor } from './processors/importBlingSalesProcessor';
import { ImportBlingInvoicesProcessor } from './processors/importInvoicesProcessor';

@Injectable()
export class BlingJob {
  private readonly logger = new Logger(BlingJob.name);

  constructor(
    private cleanSalesProcessor: CleanSalesProcessor,
    private importSalesProcessor: ImportBlingSalesProcessor,
    private importInvoicesProcessor: ImportBlingInvoicesProcessor,
  ) {}

  @Cron('0 */2 * * * *', { timeZone: 'America/Sao_Paulo' })
  async importJob() {
    this.logger.log('Starting import job run');

    try {
      if (process.env.RUNNING_CRON == 'null' || !process.env.RUNNING_CRON) {
        process.env.RUNNING_CRON = 'true';

        await this.cleanSalesProcessor.execute();
        await this.importSalesProcessor.execute();
        // await this.importInvoicesProcessor.execute();
      } else {
        this.logger.log('crontab already running, skiping job');
      }
    } catch (error) {
      this.logger.error('Error during import cron job', error);
    } finally {
      process.env.RUNNING_CRON = null;
    }
  }
}
