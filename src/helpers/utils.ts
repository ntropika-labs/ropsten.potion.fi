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
    amountRev: ethers.utils.formatEther(potion.amountRev.rawValue)
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
    { rawValue: ethers.utils.parseEther('1') }, // nTokens
    { rawValue: ethers.utils.parseEther('1') }, // assetPrice
    { rawValue: ethers.utils.parseEther('1') }, // dvmBond
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
