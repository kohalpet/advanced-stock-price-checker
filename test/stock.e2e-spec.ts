import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, HttpException } from '@nestjs/common';
import * as request from 'supertest';
import { StockModule } from '../src/stock/stock.module';
import { PrismaService } from '../src/common/prisma.service';
import { FinnhubService } from '../src/finnhub/finnhub.service';

describe('StockController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    symbol: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockFinnhubService = {
    getSymbol: jest.fn(),
    getQuote: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StockModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(FinnhubService)
      .useValue(mockFinnhubService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /stock/:symbol', () => {
    it('should return stock data with moving averages', async () => {
      const mockQuotes = [
        { price: 100, dateTime: new Date() },
        { price: 200, dateTime: new Date() },
        { price: 300, dateTime: new Date() },
      ];

      mockPrismaService.symbol.findUnique.mockResolvedValueOnce({
        id: 1,
        symbol: 'AAPL',
        quotes: mockQuotes,
      });

      const response = await request(app.getHttpServer())
        .get('/stock/AAPL')
        .query({ windowSize: 2 });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        id: 1,
        symbol: 'AAPL',
        currentPrice: 100,
        lastUpdatedAt: expect.any(String),
        movingAverages: [150, 250],
      });
    });

    it('should return 404 for non-existent symbol', async () => {
      mockPrismaService.symbol.findUnique.mockResolvedValueOnce(null);

      const response = await request(app.getHttpServer())
        .get('/stock/INVALID')
        .query({ windowSize: 2 });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /stock/:symbol', () => {
    it('should create new symbol', async () => {
      mockPrismaService.symbol.count.mockResolvedValueOnce(0);
      mockFinnhubService.getSymbol.mockResolvedValueOnce({
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock',
      });
      mockPrismaService.symbol.create.mockResolvedValueOnce({
        id: 1,
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock',
      });

      const response = await request(app.getHttpServer()).put('/stock/AAPL');

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 409 for existing symbol', async () => {
      mockPrismaService.symbol.count.mockResolvedValueOnce(1);

      const response = await request(app.getHttpServer()).put('/stock/AAPL');

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return 404 when symbol not found in Finnhub', async () => {
      mockPrismaService.symbol.count.mockResolvedValueOnce(0);
      mockFinnhubService.getSymbol.mockRejectedValueOnce(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer()).put('/stock/INVALID');

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
