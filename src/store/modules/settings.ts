import Vue from 'vue';
import { ethers } from 'ethers';
import store from '@/store';
import provider from '@/helpers/provider';
import {
  getExchangeRatesFromCoinGecko,
  getPotions,
  getAllowances,
  revitalisePotion,
  withdrawPotion
} from '@/helpers/utils';
import assets from '@/helpers/assets.json';
import { abi as ierc20Abi } from '@/helpers/abi/IERC20.json';
import { abi as factoryAbi } from '@/helpers/abi/Factory.json';
import { abi as synthAbi } from '@/helpers/abi/Synthetic.json';

const parseEther = ethers.utils.parseEther;

const ethereum = window['ethereum'];
if (ethereum) {
  ethereum.on('accountsChanged', () => store.dispatch('init'));
  ethereum.on('networkChanged', network => {
    store.commit('set', { network: ethers.utils.getNetwork(parseInt(network)) });
  });
}

const state = {
  loading: false,
  address: null,
  name: '',
  balance: 0,
  network: {},
  exchangeRates: {},
  potions: [],
  allowances: {},
  balances: {}
};

const mutations = {
  set(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('set', { loading: true });
    await dispatch('getExchangeRates');
    if (provider) {
      try {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        if (address) await dispatch('login');
      } catch (e) {
        console.log(e);
      }
    }
    commit('set', { loading: false });
  },
  login: async ({ commit, dispatch }) => {
    if (provider) {
      try {
        await ethereum.enable();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const name = await provider.lookupAddress(address);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();
        commit('set', { address });
        await dispatch('loadPotions');
        await dispatch('loadAllowances');
        commit('set', {
          name,
          balance: ethers.utils.formatEther(balance),
          network,
          loading: false
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('This website require MetaMask');
    }
  },
  loading: ({ commit }, payload) => {
    commit('set', { loading: payload });
  },
  async getExchangeRates({ commit }) {
    const exchangeRates = await getExchangeRatesFromCoinGecko();
    commit('set', { exchangeRates });
  },
  async loadPotions({ commit }) {
    const potions = await getPotions(state.address);
    console.log('Your potions', potions);
    commit('set', { potions });
  },
  async loadAllowances({ commit }) {
    const daiAddress = process.env.VUE_APP_DAI_ADDRESS;
    const addresses = [daiAddress];
    Object.entries(state.potions).forEach(potion => {
      // @ts-ignore
      addresses.push(potion[1].address);
    });
    const allowances = await getAllowances(state.address, addresses);
    console.log('Your allowances', allowances);
    commit('set', { allowances });
  },
  async revitalisePotion({ commit }, payload) {
    await revitalisePotion(payload);
  },
  async withdrawPotion({ commit }, payload) {
    await withdrawPotion(payload);
  },
  async approve({ commit }) {
    const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
    const address = process.env.VUE_APP_DAI_ADDRESS;
    const signer = provider.getSigner();
    // @ts-ignore
    const erc20 = new ethers.Contract(address, ierc20Abi, provider);
    const erc20WithSigner = erc20.connect(signer);
    const tx = await erc20WithSigner.approve(factoryAddress, parseEther((1e9).toString()));
    console.log(tx.hash);
    await tx.wait();
  },
  async approvePotion({ commit }, address) {
    const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
    const signer = provider.getSigner();
    // @ts-ignore
    const potionToken = new ethers.Contract(address, synthAbi, provider);
    const potionTokenWithSigner = potionToken.connect(signer);
    const tx = await potionTokenWithSigner.approve(factoryAddress, parseEther((1e7).toString()));
    console.log(tx.hash);
    await tx.wait();
  },
  async writeMintPotion({ commit, dispatch }, payload) {
    const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
    const finderAddress = process.env.VUE_APP_FINDER_ADDRESS;
    const tokenFactoryAddress = process.env.VUE_APP_TOKEN_FACTORY_ADDRESS;
    const timerAddress = process.env.VUE_APP_TOKEN_FACTORY_ADDRESS;
    const daiAddress = process.env.VUE_APP_DAI_ADDRESS;
    const poolLpAddress = process.env.VUE_APP_POOL_LP_ADDRESS;
    const signer = provider.getSigner();
    // @ts-ignore
    const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
    const factoryWithSigner = factory.connect(signer);
    const ticker = assets[payload.asset].ticker;

    const [year, month, day] = payload.expiry.split('-');
    const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
    const expirationTimestamp = parseInt((expiryDate.getTime() / 1000).toString()).toString();
    const syntheticName = `${ticker} Potion ${payload.expiry}`;
    const syntheticSymbol = `${ticker}POT`;
    const params = {
      expirationTimestamp,
      withdrawalLiveness: '1',
      collateralAddress: daiAddress,
      finderAddress,
      tokenFactoryAddress,
      priceFeedIdentifier: 'UMATEST',
      syntheticName,
      syntheticSymbol,
      liquidationLiveness: '1',
      collateralRequirement: { rawValue: parseEther('1.0') },
      disputeBondPct: { rawValue: parseEther('0.1') },
      sponsorDisputeRewardPct: { rawValue: parseEther('0.1') },
      disputerDisputeRewardPct: { rawValue: parseEther('0.1') },
      strikePrice: { rawValue: parseEther(payload.strike) },
      assetPrice: { rawValue: parseEther(payload.price) },
      assetClass: ticker,
      timerAddress
    };
    const tx = await factoryWithSigner.writeMintPotion(
      params,
      poolLpAddress,
      { rawValue: parseEther(payload.quantity) },
      { rawValue: parseEther(payload.premium) }
    );
    console.log(tx.hash);
    await tx.wait(1);
    await dispatch('loadPotions');
  },
  async loadBalanceIn({ commit }, payload) {
    const potionToken = new ethers.Contract(payload, synthAbi, provider);
    const balance = await potionToken.balanceOf(state.address);
    const balances = state.balances;
    balances[payload] = parseFloat(ethers.utils.formatEther(balance));
    commit('set', { balances });
  }
};

export default {
  state,
  mutations,
  actions
};
