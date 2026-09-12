import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance();
async function run() {
  try {
    const res = await yf.chart('AAPL', { period1: new Date('2024-01-01'), period2: new Date() });
    console.log(res.quotes[0]);
  } catch (e) {
    console.error(e.message);
  }
}
run();
