<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/revitalize.svg" class="mb-2" />
      <h2 class="mb-5">Your revitalization</h2>
      <div class="text-left">
        <div class="border-bottom mb-5">
          <div class="mb-4">
            Strike price<span class="float-right">${{ $n(form.potion.mintSprice) }}</span>
          </div>
          <div class="mb-4">
            Expiry date<span class="float-right">{{ form.potion.expiry | formatTs }}</span>
          </div>
          <div class="mb-5">Asset<span class="float-right" v-text="form.potion.asset" /></div>
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
        <button class="button button-primary col-6 ml-2" :disabled="!price" @click="handleSubmit">
          <VueLoadingIndicator v-if="isLoading" class="big" />
          <template v-else>
            <template v-if="isApproved">Confirm</template>
            <template v-else>Unlock {{ form.potion.asset }}POT</template>
          </template>
        </button>
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
      isApproved: false,
      isLoading: false,
      quantity: '',
      autoPrice: true,
      autoPricePerPotion: true,
      price: '',
      pricePerPotion: ''
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
      this.isApproved = true;
    },
    autoPrice(value) {
      if (value) this.price = this.currentPrice;
    }
  },
  methods: {
    ...mapActions(['approvePotion', 'revitalisePotion']),
    async handleSubmit() {
      this.isLoading = true;
      if (!this.isApproved) {
        console.log(this.form.potion.address);
        await this.approvePotion(this.form.potion.address);
        this.isApproved = true;
      } else {
        const payload = this.form.potion;
        payload.price = this.price;
        await this.revitalisePotion(payload);
        this.isConfirmed = true;
      }
      this.isLoading = false;
    }
  }
};
</script>
