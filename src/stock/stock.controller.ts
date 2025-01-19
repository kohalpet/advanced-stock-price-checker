import {
  Controller,
  Get,
  Put,
  Param,
  HttpCode,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { Symbol } from '@prisma/client';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SymbolResponse } from './stock.symbol-response';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @ApiOperation({ summary: 'Get a stock by symbol' })
  @ApiResponse({
    status: 200,
    type: SymbolResponse,
    description: 'Symbol found',
  })
  @ApiResponse({ status: 404, description: 'Symbol {symbolName} not found' })
  @ApiParam({
    name: 'symbol',
    required: true,
    type: String,
    description: 'Symbol name',
  })
  @ApiQuery({
    name: 'windowSize',
    required: false,
    type: Number,
    description: 'Window size for moving averages (default 3)',
  })
  @Get(':symbol')
  async getStock(
    @Param('symbol') symbol: string,
    @Query(
      'windowSize',
      new DefaultValuePipe(3),
      new ParseIntPipe({ optional: true }),
    )
    windowSize?: number,
  ): Promise<SymbolResponse> {
    return await this.stockService.getSymbolData(symbol, windowSize);
  }

  @ApiOperation({ summary: 'Create a stock by symbol' })
  @ApiResponse({ status: 204, description: 'Symbol created' })
  @ApiResponse({ status: 400, description: 'Bad Request on Finnhub API' })
  @ApiResponse({ status: 401, description: 'Unauthorized on Finnhub API' })
  @ApiResponse({ status: 404, description: 'Symbol not found on Finnhub API' })
  @ApiResponse({
    status: 409,
    description: 'Symbol {symbolName} already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded on Finnhub API',
  })
  @ApiParam({
    name: 'symbol',
    required: true,
    type: String,
    description: 'Symbol name',
  })
  @Put(':symbol')
  @HttpCode(204)
  async createSymbol(@Param('symbol') symbol: string): Promise<Symbol> {
    return await this.stockService.createSymbol(symbol);
  }
}
