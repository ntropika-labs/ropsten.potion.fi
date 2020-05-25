<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/revitalize.svg" class="mb-2" />
      <div v-if="step === 0">
        <h2 class="mb-5">Potion exercise</h2>
        <div class="text-left">
          <div class="border-bottom mb-5">
            <div class="mb-4">
              Strike price<span class="float-right">${{ $n(form.potion.mintSprice) }}</span>
            </div>
            <div class="mb-4">
              Expiry date<span class="float-right">{{ form.potion.expiry | formatTs }}</span>
            </div>
            <div class="mb-4">
              Asset
              <Ticker :id="coingecko[form.potion.asset]" class="float-right" />
            </div>
            <div class="mb-5">
              Available quantity<span class="float-right" v-if="isInit">
                {{ availableQuantity }}</span
              >
            </div>
          </div>
          <h2 class="mb-5 text-center">Balance revitalization</h2>
          <div class="mb-4">
            <input type="number" class="input" placeholder="Quantity" v-model="quantity" />
          </div>
          <div class="mb-3">
            Auto asset price
            <span class="float-right">
              <VueSwitch v-model="autoPrice" />
            </span>
          </div>
          <div class="mb-4">
            <input
              :readonly="autoPrice"
              type="number"
              class="input mb-3"
              placeholder="Price"
              v-model="price"
            />
            <h6 v-if="!autoPrice">
              Using non-market prices may result in losses.
              <a
                href="https://potion.gitbook.io/docs/exercising-a-potion/buying-a-potion"
                target="_blank"
              >
                Learn more
              </a>
            </h6>
          </div>
          <div class="mb-3">
            Auto price per potion
            <span class="float-right">
              <VueSwitch v-model="autoPricePerPotion" />
            </span>
          </div>
          <div class="mb-5">
            <input
              :readonly="autoPricePerPotion"
              type="number"
              class="input mb-3"
              placeholder="Price per potion"
              v-model="pricePerPotion"
            />
            <h6 v-if="!autoPricePerPotion">
              Using non-market prices may result in losses.
              <a
                href="https://potion.gitbook.io/docs/exercising-a-potion/buying-a-potion"
                target="_blank"
              >
                Learn more
              </a>
            </h6>
          </div>
        </div>
        <h2 class="mb-4">Want to use?</h2>
        <div class="d-flex mb-2">
          <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
          <button
            class="button button-primary col-6 ml-2"
            v-if="!isApproved"
            :disabled="isLoading"
            @click="handleApprovePotion"
          >
            <VueLoadingIndicator v-if="isLoading" class="big" />
            <template v-else>Unlock {{ form.potion.asset }}POT</template>
          </button>
          <button
            v-else
            class="button button-primary col-6 ml-2"
            :disabled="!price || !quantity"
            @click="step = 1"
          >
            Next
          </button>
        </div>
      </div>
      <div v-else-if="step === 1">
        <h2 class="mb-5">Be careful</h2>
        <p class="mb-5">
          In order to liquidate you must stake DAI. If you entered wrong values and are disputed,
          you may lose these as penalty.
        </p>
        <p class="mb-2">Your stake</p>
        <h1 class="text-primary mb-5">5 DAI</h1>
        <h2 class="mb-5">Want to proceed?</h2>
        <div class="d-flex mb-2">
          <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
          <button
            class="button button-primary col-6 ml-2"
            :disabled="isLoading"
            @click="handleRevitalisePotion"
          >
            <VueLoadingIndicator v-if="isLoading" class="big" />
            <template v-else>Confirm</template>
          </button>
        </div>
      </div>
      <div v-else-if="step > 1">
        <h2 class="mb-5">Hocus pocus!</h2>
        <div v-if="step === 2">
          <VueLoadingIndicator class="loading-lg mb-5" />
          <h2 class="mb-5" v-if="step === 2">Sponsor is verifying…</h2>
          <p class="mb-5">Current price set to ${{ $n(price) }}</p>
        </div>
        <div v-if="step === 3">
          <img src="~/@/assets/check.svg" height="118" class="mb-5" />
          <h2 class="mb-5">Revitalization went good!</h2>
          <p class="mb-5">DAI available to be withdrawn.</p>
        </div>
        <div>
          <a @click="$emit('close')" class="col-6 button button-outline">
            Back to home
          </a>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getBS, formatTs, getMinDay, getDeploymentTimestamp } from '@/helpers/utils';
import coingecko from '@/helpers/coingecko.json';

export default {
  props: ['open', 'form'],
  data() {
    return {
      step: 0,
      isInit: false,
      isApproved: false,
      isConfirmed: false,
      isLoading: false,
      quantity: '',
      autoPrice: true,
      autoPricePerPotion: true,
      price: '',
      pricePerPotion: '',
      coingecko
    };
  },
  computed: {
    ...mapState(['settings']),
    currentPrice() {
      const asset = coingecko[this.form.potion.asset];
      return this.settings.exchangeRates[asset] && this.settings.exchangeRates[asset].usd
        ? this.settings.exchangeRates[asset].usd.toFixed(2)
        : 0;
    },
    availableQuantity() {
      return this.settings.balances[this.form.potion.address] || 0;
    }
  },
  watch: {
    async open(value, oldValue) {
      if (value === true && oldValue === false) {
        await this.init();
      }
      this.autoPrice = true;
      this.price = this.currentPrice;
      this.isLoading = false;
      this.isConfirmed = false;
      const allowance = parseFloat(this.settings.allowances[this.form.potion.address] || '0');
      this.isApproved = !!allowance;
      this.isConfirmed = false;
      this.step = 0;
    },
    autoPrice(value) {
      if (value) this.price = this.currentPrice;
    },
    price(value, oldValue) {
      if (value !== oldValue && this.autoPricePerPotion) this.init();
    }
  },
  methods: {
    ...mapActions(['approvePotion', 'revitalisePotion', 'loadBalanceIn', 'getBS']),
    async handleApprovePotion() {
      this.isLoading = true;
      try {
        await this.approvePotion(this.form.potion.address);
        this.isApproved = true;
      } catch (e) {
        console.error(e);
      }
      this.isLoading = false;
    },
    async handleRevitalisePotion() {
      this.isLoading = true;
      const payload = this.form.potion;
      payload.price = this.price;
      payload.quantity = this.quantity;
      try {
        this.step++;
        await this.revitalisePotion(payload);
        this.step++;
        this.isConfirmed = true;
      } catch (e) {
        console.error(e);
      }
      this.isLoading = false;
    },
    async init() {
      this.quantity = '';
      this.autoPrice = true;
      this.price = this.currentPrice;
      this.pricePerPotion = '';

      console.log('================================');
      console.log(this.form.potion.address);
      await this.loadBalanceIn(this.form.potion.address);

      const tMinting = parseInt(await getDeploymentTimestamp(this.form.potion.contractAddress));
      console.log('T minting', tMinting);

      const tLiquidiation = new Date().getTime() / 1000 + 86400 * 5;
      console.log('T liquidiation', tLiquidiation);

      const t = (tLiquidiation - tMinting) / 31536000;
      console.log('t', t); // 0.0410959

      const ticker = coingecko[this.form.potion.asset];
      this.bs = await getBS(
        ticker,
        parseInt(new Date().getTime() / 1000),
        parseFloat(this.form.potion.mintAprice),
        parseFloat(this.form.potion.mintSprice),
        t
      );
      this.pricePerPotion = this.bs;
      this.isInit = true;
    }
  }
};
</script>
