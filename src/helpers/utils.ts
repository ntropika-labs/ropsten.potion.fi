import provider from '@/helpers/provider';
import assets from '@/helpers/assets.json';
import premium from '@/helpers/premium.json';
import { abi as ierc20Abi } from '@/helpers/abi/IERC20.json';
import { abi as factoryAbi } from '@/helpers/abi/Factory.json';
import { ethers } from 'ethers';

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

export async function getPotions(address) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  // @ts-ignore
  const contract = new ethers.Contract(factoryAddress, factoryAbi, provider);
  return await contract.getBuyerPotions(address);
}

export async function getAllowances(address) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  const daiAddress = process.env.VUE_APP_DAI_ADDRESS;
  // @ts-ignore
  const contract = new ethers.Contract(daiAddress, ierc20Abi, provider);
  const daiAllowance = await contract.allowance(address, factoryAddress);
  return { DAI: ethers.utils.formatEther(daiAllowance) };
}
