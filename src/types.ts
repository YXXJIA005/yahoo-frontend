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
  roic?: number;
  
  operatingCashFlow?: number;
  freeCashFlow?: number;
  fcfYield?: number;
  priceToFcf?: number;

  debtToEquity?: number;
  debtToEbitda?: number;
  currentRatio?: number;
  quickRatio?: number;
  interestCoverage?: number;

  forwardPE?: number;
  evToEbitda?: number;
  evToRevenue?: number;

  priceTo50DayRangePercent?: number;
  
  // Tactical Synthesis
  redFlags?: string[];
  catalysts?: string[];
  fundamentalQuality?: string;
  momentumAlignment?: string;
  swingTradeBias?: string;
}

export interface MarketDataResponse {
  data: StockData[];
  error?: string;
}
