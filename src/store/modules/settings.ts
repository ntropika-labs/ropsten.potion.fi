import Vue from 'vue';
import { ethers } from 'ethers';
import store from '@/store';
import provider from '@/helpers/provider';

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
    dispatch('getExchangeRates').then(() => commit('set', { loading: false }));
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
  getExchangeRates({ commit }) {
    const uri = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
    fetch(uri)
      .then(res => res.json())
      .then(json => {
        commit('set', { exchangeRates: json });
      });
  }
};

export default {
  state,
  mutations,
  actions
};
