import { ApiProperty } from '@nestjs/swagger';

export class SymbolResponse {
  @ApiProperty({ type: 'integer', description: 'The id of the symbol' })
  id: number;
  @ApiProperty({ type: 'string', description: 'The symbol name' })
  symbol: string;
  @ApiProperty({
    type: 'number',
    required: false,
    description: 'The current price of the symbol',
  })
  currentPrice: number | undefined;
  @ApiProperty({
    type: 'string',
    required: false,
    description: 'The last update date of the symbol',
  })
  lastUpdatedAt: Date | undefined;
  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    required: false,
    description: 'The moving averages of the symbol',
  })
  movingAverages: number[] | undefined;
}
