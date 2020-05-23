<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/recipe.svg" class="mb-2" />
      <div v-if="!isConfirmed">
        <h2 class="mb-5">Your recipe</h2>
        <div class="text-left">
          <div class="border-bottom mb-5">
            <div class="mb-4">
              Strike price<span class="float-right">${{ $n(form.strike) }}</span>
            </div>
            <div class="mb-4">Expiry date<span class="float-right" v-text="form.expiry" /></div>
            <div class="mb-4">Asset<span class="float-right" v-text="form.asset" /></div>
            <div class="mb-4">
              Auto price
              <span class="float-right">
                <VueSwitch v-model="autoPrice" />
              </span>
            </div>
            <div class="mb-5">
              <input
                :readonly="autoPrice"
                type="number"
                class="input mb-3"
                placeholder="Price"
                :value="currentPrice"
              />
              <h6 v-if="!autoPrice">
                Using non-market prices may result in losses. <a>Learn more</a>
              </h6>
            </div>
          </div>
          <div class="mb-4">
            Quantity<span class="float-right">{{ $n(form.quantity) }}</span>
          </div>
          <div class="mb-4">
            Price per potion<span class="float-right">{{ $n(blackScholes) }} DAI</span>
          </div>
          <div class="mb-5 text-bold text-primary">
            Total price<span class="float-right">{{ $n(form.quantity * 5) }} DAI</span>
          </div>
        </div>
        <h2 class="mb-4">Want to purchase?</h2>
        <div class="d-flex mb-2">
          <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
          <button class="button button-primary col-6 ml-2" @click="handleSubmit">
            <VueLoadingIndicator v-if="isLoading" class="big" />
            <template v-else>
              <template v-if="isApproved">Confirm</template>
              <template v-else>Unlock DAI</template>
            </template>
          </button>
        </div>
      </div>
      <div v-else>
        <h2 class="mb-5">Mix, turn and pour</h2>
        <VueLoadingIndicator class="loading-lg mb-5" />
        <p class="mb-3">Potion Gold strike ${{ $n(1500) }} August 2020</p>
        <h2 class="mb-5">Wait for creation…</h2>
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
import bs from 'black-scholes';
import { mapActions, mapState } from 'vuex';

export default {
  props: ['open', 'form'],
  data() {
    return {
      isLoading: false,
      isApproved: true,
      isConfirmed: false,
      autoPrice: true
    };
  },
  computed: {
    ...mapState(['settings']),
    currentPrice() {
      return this.settings.exchangeRates.bitcoin
        ? this.settings.exchangeRates.bitcoin.usd.toFixed(0)
        : 0;
    },
    blackScholes() {
      return bs.blackScholes(this.currentPrice, this.form.strike, (1 / 365) * 7, 0.2, 0, 'put');
    }
  },
  methods: {
    ...mapActions(['login', 'approve', 'writeMintPotion']),
    handleSubmit() {
      this.isLoading = true;
      if (this.isApproved) {
        this.writeMintPotion().then(() => {
          this.isConfirmed = true;
          this.isLoading = false;
        });
      } else {
        this.approve().then(() => {
          this.isApproved = true;
          this.isLoading = false;
        });
      }
    }
  }
};
</script>
