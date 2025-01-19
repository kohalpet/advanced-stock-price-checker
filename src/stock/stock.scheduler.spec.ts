import { Test, TestingModule } from '@nestjs/testing';
import { StockScheduler } from './stock.scheduler';
import { StockService } from './stock.service';
import { FinnhubService } from '../finnhub/finnhub.service';

describe('StockScheduler', () => {
  let stockScheduler: StockScheduler;

  const mockStockService = {
    getSymbols: jest.fn(),
    createQuote: jest.fn(),
  };

  const mockFinnhubService = {
    getQuote: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockScheduler,
        { provide: StockService, useValue: mockStockService },
        { provide: FinnhubService, useValue: mockFinnhubService },
      ],
    }).compile();

    stockScheduler = module.get<StockScheduler>(StockScheduler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCron', () => {
    it('should update prices for all symbols', async () => {
      const mockSymbols = [
        { id: 1, symbol: 'AAPL' },
        { id: 2, symbol: 'GOOGL' },
      ];

      mockStockService.getSymbols.mockResolvedValue(mockSymbols);
      mockStockService.createQuote.mockResolvedValue(undefined);

      await stockScheduler.handleCron();

      expect(mockStockService.getSymbols).toHaveBeenCalled();
      expect(mockStockService.createQuote).toHaveBeenCalledTimes(2);
      expect(mockStockService.createQuote).toHaveBeenCalledWith(1, 'AAPL');
      expect(mockStockService.createQuote).toHaveBeenCalledWith(2, 'GOOGL');
    });

    it('should handle empty symbols list', async () => {
      mockStockService.getSymbols.mockResolvedValue([]);

      await stockScheduler.handleCron();

      expect(mockStockService.getSymbols).toHaveBeenCalled();
      expect(mockStockService.createQuote).not.toHaveBeenCalled();
    });
  });
});
