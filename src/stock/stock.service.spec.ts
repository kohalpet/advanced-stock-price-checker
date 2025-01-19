import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { StockService } from './stock.service';
import { PrismaService } from '../common/prisma.service';
import { FinnhubService } from '../finnhub/finnhub.service';

describe('StockService', () => {
  let stockService: StockService;

  const mockPrismaService = {
    symbol: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    quote: {
      create: jest.fn(),
    },
  };

  const mockFinnhubService = {
    getSymbol: jest.fn(),
    getQuote: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FinnhubService, useValue: mockFinnhubService },
      ],
    }).compile();

    stockService = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSymbolData', () => {
    it('should return symbol data with moving averages', async () => {
      const mockQuotes = [
        { price: 100, dateTime: new Date() },
        { price: 200, dateTime: new Date() },
        { price: 300, dateTime: new Date() },
      ];

      mockPrismaService.symbol.findUnique.mockResolvedValue({
        id: 1,
        symbol: 'AAPL',
        quotes: mockQuotes,
      });

      const result = await stockService.getSymbolData('AAPL', 2);

      expect(result).toEqual({
        id: 1,
        symbol: 'AAPL',
        currentPrice: 100,
        lastUpdatedAt: expect.any(Date),
        movingAverages: [150, 250],
      });
    });

    it('should throw when symbol not found', async () => {
      mockPrismaService.symbol.findUnique.mockResolvedValue(null);

      await expect(stockService.getSymbolData('INVALID', 2)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createSymbol', () => {
    it('should create a new symbol', async () => {
      mockPrismaService.symbol.count.mockResolvedValue(0);
      mockFinnhubService.getSymbol.mockResolvedValue({
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock',
      });
      mockPrismaService.symbol.create.mockResolvedValue({
        id: 1,
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock',
      });

      const result = await stockService.createSymbol('AAPL');

      expect(result).toEqual({
        id: 1,
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock',
      });
    });

    it('should throw when symbol already exists', async () => {
      mockPrismaService.symbol.count.mockResolvedValue(1);

      await expect(stockService.createSymbol('AAPL')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createQuote', () => {
    it('should create a new quote', async () => {
      const mockQuote = {
        c: 150.5,
        t: 1234567890,
      };

      mockFinnhubService.getQuote.mockResolvedValue(mockQuote);
      mockPrismaService.quote.create.mockResolvedValue({
        id: 1,
        symbolId: 1,
        price: 150.5,
        dateTime: new Date(1234567890 * 1000),
      });

      const result = await stockService.createQuote(1, 'AAPL');

      expect(result).toEqual({
        id: 1,
        symbolId: 1,
        price: 150.5,
        dateTime: expect.any(Date),
      });
    });
  });
});
