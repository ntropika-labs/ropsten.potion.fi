<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/revitalize.svg" class="mb-2" />
      <div v-if="step === 0">
        <h2 class="mb-5">Your revitalization</h2>
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
            <div class="mb-5">Available quantity<span class="float-right">X</span></div>
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
            :disabled="!price"
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
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import coingecko from '@/helpers/coingecko.json';

export default {
  props: ['open', 'form'],
  data() {
    return {
      step: 0,
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
    }
  },
  watch: {
    open() {
      this.autoPrice = true;
      this.price = this.currentPrice;
      this.isLoading = false;
      this.isConfirmed = false;
      const allowance = parseFloat(this.settings.allowances[this.form.potion.address] || '0');
      this.isApproved = !!allowance;
      this.isConfirmed = false;
    },
    autoPrice(value) {
      if (value) this.price = this.currentPrice;
    }
  },
  methods: {
    ...mapActions(['approvePotion', 'revitalisePotion']),
    async handleApprovePotion() {
      this.isLoading = true;
      console.log(this.form.potion.address);
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
      try {
        await this.revitalisePotion(payload);
        this.isConfirmed = true;
      } catch (e) {
        console.error(e);
      }
      this.isLoading = false;
    },
    async handleStakeDai() {
      alert('Stake DAI');
    }
  }
};
</script>
