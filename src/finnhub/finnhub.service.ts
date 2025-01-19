import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FinnhubSymbolResult } from './finnhub.symbol-result.interface';
import { FinnhubSymbol } from './finnhub.symbol.interface';
import { FinnhubQuote } from './finnhub.quote.interface';

@Injectable()
export class FinnhubService {
  private readonly logger = new Logger(FinnhubService.name);

  private readonly apiKey = this.configService.get('FINNHUB_API_KEY');
  private readonly baseUrl = 'https://finnhub.io/api/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getSymbol(symbol: string): Promise<FinnhubSymbol> {
    let result;
    try {
      const response = await firstValueFrom(
        this.httpService.get<FinnhubSymbolResult>(`${this.baseUrl}/search`, {
          params: { exchange: 'US', q: symbol, token: this.apiKey },
        }),
      );

      const results = response.data.result;
      result = results.find((r) => r.symbol === symbol);

      if (!result) {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.handleError(error);
      throw new Error('This should never happen, but TypeScript needs it');
    }

    return result;
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    let result;
    try {
      const response = await firstValueFrom(
        this.httpService.get<FinnhubQuote>(`${this.baseUrl}/quote`, {
          params: { symbol: symbol, token: this.apiKey },
        }),
      );

      result = response.data;
    } catch (error) {
      this.handleError(error);
      throw new Error('This should never happen, but TypeScript needs it');
    }

    return result;
  }

  private handleError(error: any) {
    if (error.response) {
      if (error.status === 404) {
        this.logger.error('Symbol not found on Finnhub API');
        throw new HttpException(
          'Symbol not found on Finnhub API',
          HttpStatus.NOT_FOUND,
        );
      } else if (error.status === 429) {
        this.logger.error('Rate limit exceeded on Finnhub API');
        throw new HttpException(
          'Rate limit exceeded on Finnhub API',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else if (error.status === 401) {
        this.logger.error('Unauthorized on Finnhub API');
        throw new HttpException(
          'Unauthorized  on Finnhub API',
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        this.logger.error('Bad Request on Finnhub API');
        throw new HttpException(
          'Bad Request on Finnhub API',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (error.request) {
      this.logger.error('Request error on Finnhub API');
      throw new HttpException(
        'Request error on Finnhub API: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      this.logger.error('Error on Finnhub API');
      throw new HttpException(
        'Error on Finnhub API: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
