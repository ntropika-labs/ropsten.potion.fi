import assets from '@/helpers/assets.json';
import premium from '@/helpers/premium.json';

export function shorten(str) {
  if (str.length < 10) return str;
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export async function getExchangeRatesFromCoinGecko() {
  const ids = Object.entries(assets)
    // @ts-ignore
    .map(asset => asset[1].coingeckoId)
    .join(',');
  const uri = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  return await fetch(uri).then(res => res.json());
}

export async function getMarketChartFromCoinGecko(coingeckoId) {
  const ratePerDay = {};
  const uri = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=31`;
  const marketChart = await fetch(uri).then(res => res.json());
  marketChart.prices.forEach(p => {
    const date = new Date();
    date.setTime(p[0]);
    const day = date.toISOString().split('T')[0];
    ratePerDay[day] = p[1];
  });
  return ratePerDay;
}

export async function getBlackScholes(coingeckoId) {
  return await getMarketChartFromCoinGecko(coingeckoId);
}

export function getPremiumDeposit(strike, price, days) {
  const otm = 1 - strike / price;
  let premiumDeposit;
  Object.entries(premium).forEach(p => {
    if (otm > parseFloat(p[0])) premiumDeposit = p[1][days.toString()] * strike;
  });
  return premiumDeposit;
}
