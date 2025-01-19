import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockService } from './stock.service';
import { FinnhubService } from '../finnhub/finnhub.service';

@Injectable()
export class StockScheduler {
  private readonly logger = new Logger(StockScheduler.name);

  constructor(
    private readonly stockService: StockService,
    private readonly finnhubService: FinnhubService,
  ) {}

  @Cron('* * * * *')
  async handleCron() {
    this.logger.log('Updating stock prices');
    const symbols = await this.stockService.getSymbols();
    for (const { id, symbol } of symbols) {
      await this.stockService.createQuote(id, symbol);
    }
  }
}
