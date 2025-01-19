import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { FinnhubService } from './finnhub.service';
import { HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('FinnhubService', () => {
  let finnhubService: FinnhubService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake-api-key'),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FinnhubService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    finnhubService = moduleRef.get<FinnhubService>(FinnhubService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSymbol', () => {
    it('should return symbol data when found', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              description: 'APPLE INC',
              displaySymbol: 'AAPL',
              symbol: 'AAPL',
              type: 'Common Stock',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await finnhubService.getSymbol('AAPL');
      expect(result).toEqual(mockResponse.data.result[0]);
    });

    it('should throw not found when symbol does not exist', async () => {
      mockHttpService.get.mockReturnValueOnce(of({ data: { result: [] } }));

      await expect(finnhubService.getSymbol('INVALID')).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle status 429 API errors', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => ({ response: {}, status: 429 })),
      );

      await expect(finnhubService.getSymbol('AAPL')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getQuote', () => {
    it('should return quote data with correct property types', async () => {
      const mockQuote = {
        c: 150.5,
        h: 151.0,
        l: 149.0,
        o: 149.5,
        pc: 148.5,
        t: 1234567890,
      };

      mockHttpService.get.mockReturnValueOnce(of({ data: mockQuote }));

      const result = await finnhubService.getQuote('AAPL');
      expect(result).toEqual(
        expect.objectContaining({
          c: expect.any(Number),
          h: expect.any(Number),
          l: expect.any(Number),
          o: expect.any(Number),
          pc: expect.any(Number),
          t: expect.any(Number),
        }),
      );
    });

    it('should handle API errors', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => ({ response: { status: 401 } })),
      );

      await expect(finnhubService.getQuote('AAPL')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
