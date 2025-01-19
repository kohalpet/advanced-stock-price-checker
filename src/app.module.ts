import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StockModule } from './stock/stock.module';
import { CommonModule } from './common/common.module';
import { FinnhubModule } from './finnhub/finnhub.module';

@Module({
  imports: [ScheduleModule.forRoot(), StockModule, CommonModule, FinnhubModule],
})
export class AppModule {}
