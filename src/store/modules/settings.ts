import Vue from 'vue';
import { ethers } from 'ethers';
import store from '@/store';
import provider from '@/helpers/provider';
import { abi as ierc20Abi } from '@/helpers/abi/IERC20.json';
import { abi as factoryAbi } from '@/helpers/abi/Factory.json';

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
  exchangeRates: {}
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
    if (provider) {
      try {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        if (address) await dispatch('login');
      } catch (e) {
        console.log(e);
      }
    }
    await dispatch('getExchangeRates');
    commit('set', { loading: false });
  },
  login: async ({ commit }) => {
    if (provider) {
      try {
        await ethereum.enable();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const name = await provider.lookupAddress(address);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();
        commit('set', {
          address,
          name,
          balance: ethers.utils.formatEther(balance),
          network,
          loading: false
        });
      } catch (error) {
        console.error(error);
      }
    }
  },
  loading: ({ commit }, payload) => {
    commit('set', { loading: payload });
  },
  async getExchangeRates({ commit }) {
    const uri = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
    const json = await fetch(uri).then(res => res.json());
    commit('set', { exchangeRates: json });
  },
  async approve({ commit }) {
    const daiAddress = process.env.VUE_APP_DAI_ADDRESS;
    const factoryAddress = process.env.VUE_APP_FACTORY_ADDRESS;
    const signer = provider.getSigner();
    // @ts-ignore
    const contract = new ethers.Contract(daiAddress, ierc20Abi, provider);
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.approve(
      factoryAddress,
      ethers.utils.parseEther('100000000000')
    );
    console.log(tx.hash);
    await tx.wait();
  },
  async create({ commit }) {
    // await new Promise(resolve => setTimeout(resolve, 1e3));
  }
};

export default {
  state,
  mutations,
  actions
};
