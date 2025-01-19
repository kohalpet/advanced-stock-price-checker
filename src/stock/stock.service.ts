import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma, Quote, Symbol } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { FinnhubService } from '../finnhub/finnhub.service';
import { SymbolResponse } from './stock.symbol-response';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly finnhubService: FinnhubService,
  ) {}

  async getSymbolData(
    symbolName: string,
    windowSize: number = 3,
  ): Promise<SymbolResponse> {
    const symbolWithQuotas = await this.prismaService.symbol.findUnique({
      where: {
        symbol: symbolName,
      },
      include: {
        quotes: {
          orderBy: {
            dateTime: 'desc',
          },
          take: 10,
        },
      },
    });

    if (symbolWithQuotas === null) {
      this.logger.error(`Symbol ${symbolName} not found`);
      throw new HttpException(
        `Symbol ${symbolName} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { id, symbol } = symbolWithQuotas;

    const lastQuote = symbolWithQuotas.quotes?.at(0);

    const movingAverages = lastQuote
      ? this.calculateMovingAverages(symbolWithQuotas.quotes, windowSize)
      : undefined;

    return {
      id,
      symbol,
      currentPrice: lastQuote?.price,
      lastUpdatedAt: lastQuote?.dateTime,
      movingAverages,
    };
  }

  async getSymbols(): Promise<
    Prisma.SymbolGetPayload<{
      include: { quotes: true };
    }>[]
  > {
    return this.prismaService.symbol.findMany({
      include: {
        quotes: {
          orderBy: {
            dateTime: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async createSymbol(symbolName: string): Promise<Symbol> {
    if (await this.isExistingSymbol(symbolName)) {
      this.logger.error(`Symbol ${symbolName} already exists`);
      throw new HttpException(
        `Symbol ${symbolName} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const { symbol, description, type } =
      await this.finnhubService.getSymbol(symbolName);
    return this.prismaService.symbol.create({
      data: {
        symbol,
        description,
        type,
      },
    });
  }

  async createQuote(symbolId: number, symbolName: string): Promise<Quote> {
    const { c: price, t: timestamp } =
      await this.finnhubService.getQuote(symbolName);
    return this.prismaService.quote.create({
      data: { symbolId, price, dateTime: new Date(timestamp * 1000) },
    });
  }

  calculateMovingAverages(quotes: Quote[], windowSize: number): number[] {
    if (quotes.length < windowSize) {
      windowSize = quotes.length;
    }
    this.logger.log(
      `Calculating moving averages with window size ${windowSize}`,
    );

    const result = [];

    for (let i = 0; i <= quotes.length - windowSize; i++) {
      this.logger.log(`Calculating moving average for window ${i}`);
      const window = quotes.slice(i, i + windowSize);
      const average =
        window.reduce((sum, quote) => sum + quote.price, 0) / windowSize;
      this.logger.log(`Average for window ${i}: ${average}`);
      result.push(average);
    }

    return result;
  }

  private async isExistingSymbol(symbolName: string): Promise<boolean> {
    const count = await this.prismaService.symbol.count({
      where: {
        symbol: symbolName,
      },
    });

    return count > 0;
  }
}
