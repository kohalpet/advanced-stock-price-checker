import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { FinnhubService } from '../finnhub/finnhub.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  providers: [FinnhubService],
  exports: [FinnhubService],
})
export class FinnhubModule {}
