import bs from 'black-scholes';
import volatility from 'volatility';
import provider from '@/helpers/provider';
import assets from '@/helpers/assets.json';
import premium from '@/helpers/premium.json';
import { abi as ierc20Abi } from '@/helpers/abi/IERC20.json';
import { abi as factoryAbi } from '@/helpers/abi/Factory.json';
import { abi as potionAbi } from '@/helpers/abi/Potion.json';
import { abi as expierc20Abi } from '@/helpers/abi/ExpandedIERC20.json';
import { ethers } from 'ethers';

export function formatTs(ts) {
  if (!ts) return '';
  const date = new Date(ts * 1000);
  return date.toISOString().split('T')[0];
}

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

export function getPremiumDeposit(strike, price, days) {
  const otm = 1 - strike / price;
  let premiumDeposit;
  Object.entries(premium).forEach(p => {
    if (otm > parseFloat(p[0])) premiumDeposit = p[1][days.toString()] * strike;
  });
  return premiumDeposit;
}

export async function getPotion(address) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  const potionContract = new ethers.Contract(address, potionAbi, provider);
  // @ts-ignore
  const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const potion = await factoryContract.getPotionData(potionContract.address);
  const potionToken = new ethers.Contract(
    await potionContract.tokenCurrency(),
    expierc20Abi,
    provider
  );
  return {
    contractAddress: potionContract.address,
    address: potionToken.address,
    asset: potion.asset,
    mintAprice: ethers.utils.formatEther(potion.mintAprice.rawValue),
    mintSprice: ethers.utils.formatEther(potion.mintSprice.rawValue),
    mintDepo: ethers.utils.formatEther(potion.mintDepo.rawValue),
    expiry: potion.expiry.toString(),
    revitID: potion.revitID.toString(),
    amountRev: ethers.utils.formatEther(potion.amountRev.rawValue),
    collateralToWithdraw: ethers.utils.formatEther(potion.collateralToWithdraw.rawValue)
  };
}

export async function getPotions(address) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  // @ts-ignore
  const contract = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const addresses = await contract.getBuyerPotions(address);
  const promises = [];
  // @ts-ignore
  addresses.forEach(potionAddress => promises.push(getPotion(potionAddress)));
  return await Promise.all(promises);
}

export async function getAllowances(address, tokenAddresses) {
  const allowances = {};
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  const promises = [];
  tokenAddresses.forEach(tokenAddress => {
    const contract = new ethers.Contract(tokenAddress, ierc20Abi, provider);
    // @ts-ignore
    promises.push(contract.allowance(address, factoryAddress));
  });
  Promise.all(promises).then(result => {
    result.forEach((allowance, i) => {
      allowances[tokenAddresses[i]] = ethers.utils.formatEther(allowance);
    });
  });
  return allowances;
}

export async function revitalisePotion(payload) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  const poolLpAddress = process.env.VUE_APP_POOL_LP_ADDRESS;
  const signer = provider.getSigner();
  // @ts-ignore
  const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const factoryWithSigner = factory.connect(signer);
  const tx = await factoryWithSigner.revitalisePotion(
    payload.contractAddress,
    poolLpAddress,
    { rawValue: ethers.utils.parseEther(payload.quantity) }, // nTokens
    { rawValue: ethers.utils.parseEther(payload.price) }, // assetPrice
    { rawValue: ethers.utils.parseEther('5') }, // dvmBond
    { rawValue: ethers.utils.parseEther('1') }, // finalDeposit
    { gasLimit: 7e6, gasPrice: ethers.utils.parseUnits('20', 'gwei') }
  );
  console.log('Revitalize tx', tx.hash);
  await tx.wait();
}

export async function withdrawPotion(payload) {
  const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
  const poolLpAddress = process.env.VUE_APP_POOL_LP_ADDRESS;
  const signer = provider.getSigner();
  // @ts-ignore
  const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const factoryWithSigner = factory.connect(signer);
  const tx = await factoryWithSigner.withdrawPotion(
    payload.revitalID,
    payload.potionAddress,
    poolLpAddress
  );
  console.log('Withdraw tx', tx.hash);
  await tx.wait();
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

export async function getVolatility(coingeckoId, fromDay) {
  const fromDate = new Date(fromDay);
  fromDate.setDate(fromDate.getDate() - 2);
  const pricePerDay = await getMarketChartFromCoinGecko(coingeckoId);
  const pricePerDayValid = {};
  Object.entries(pricePerDay).forEach(price => {
    if (new Date(price[0]) > fromDate) pricePerDayValid[price[0]] = price[1];
  });
  console.log('Price per day', pricePerDayValid);
  let prevPrice;
  const priceArr = [];
  Object.entries(pricePerDayValid).forEach(priceValid => {
    // @ts-ignore
    if (prevPrice) priceArr.push(Math.log(priceValid[1] / prevPrice));
    prevPrice = priceValid[1];
  });
  console.log('Price array', priceArr);
  console.log('coingeckoId', coingeckoId);
  return Math.sqrt(365) * volatility(priceArr);
}

export async function getBS(coingeckoId, fromDay, k, s, t) {
  const v = await getVolatility(coingeckoId, fromDay);
  console.log('v:', v); // Volatility between minting and liquidation
  console.log('s:', s); // Price at minting
  console.log('k:', k); // Strike price
  console.log('t:', t); // Time between minting and liquidation
  const BS = bs.blackScholes(s, k, t, v, 0, 'put');
  console.log('BS =', BS);
  return BS;
}

export function getMinDay(mintDay) {
  const ms = new Date().getTime() + 86400000 * 5;
  const minDay = new Date(ms);
  return mintDay > minDay ? mintDay : minDay;
}

export async function getDeploymentTimestamp(address) {
  // @ts-ignore
  const potionContract = new ethers.Contract(address, potionAbi, provider);
  const deploymentTimestamp = await potionContract.getDeploymentTimestamp();
  return deploymentTimestamp.toString();
}
