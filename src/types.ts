export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface RSIChartDataPoint {
  date: string;
  rsi: number;
}

export interface StockData {
  ticker: string;
  name?: string;
  price?: number;
  changePercent?: number;
  rangeHigh?: number;
  rangeLow?: number;
  rsi?: number;
  pegRatio?: number;
  peRatio?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dividendYield?: number;
  eps?: number;
  priceToBook?: number;
  beta?: number;
  volume?: number;
  chartData?: ChartDataPoint[];
  rsiChartData?: RSIChartDataPoint[];
  error?: string;

  // New Metrics
  grossMargin?: number;
  operatingMargin?: number;
  roe?: number;
  roa?: number;
  
  operatingCashFlow?: number;
  freeCashFlow?: number;

  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;

  forwardPE?: number;
  evToEbitda?: number;
  evToRevenue?: number;

  priceTo50DayRangePercent?: number;
}

export interface MarketDataResponse {
  data: StockData[];
  error?: string;
}
