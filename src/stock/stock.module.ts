import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { FinnhubModule } from '../finnhub/finnhub.module';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockScheduler } from './stock.scheduler';

@Module({
  controllers: [StockController],
  providers: [StockService, StockScheduler],
  imports: [CommonModule, FinnhubModule],
})
export class StockModule {}
