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
            <div class="mb-4">
              Expiry date
              <span class="float-right" v-text="form.expiry" />
            </div>
            <div class="mb-4">
              Asset
              <Ticker class="float-right" :id="form.asset" />
            </div>
            <div class="mb-3">
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
          </div>
          <div class="mb-4">
            Quantity<span class="float-right">{{ $n(form.quantity) }}</span>
          </div>
          <div class="mb-4">
            Deposit per potion<span class="float-right">{{ $n(premiumDeposit) }} DAI</span>
          </div>
          <div class="mb-5 text-bold text-primary">
            Total deposit<span class="float-right"
              >{{ $n(form.quantity * premiumDeposit) }} DAI</span
            >
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
        <VueLoadingIndicator class="loading-lg mb-5" v-if="!isCompleted" />
        <img v-else src="~/@/assets/check.svg" height="118" class="mb-5" />
        <p class="mb-5">
          Potion for <Ticker :id="form.asset" type="short" class="ml-1" /> at ${{
            $n(form.strike)
          }}
          on {{ form.expiry }}
        </p>
        <h2 class="mb-5" v-if="!isCompleted">Wait for creation…</h2>
        <h2 class="mb-5" v-else>Potion created!</h2>
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
import { getPremiumDeposit } from '../../helpers/utils';

export default {
  props: ['open', 'form'],
  data() {
    return {
      isCompleted: false,
      isLoading: false,
      isApproved: true,
      isConfirmed: false,
      autoPrice: true,
      price: 0
    };
  },
  computed: {
    ...mapState(['settings']),
    currentPrice() {
      return this.settings.exchangeRates[this.form.asset] &&
        this.settings.exchangeRates[this.form.asset].usd
        ? this.settings.exchangeRates[this.form.asset].usd.toFixed(2)
        : 0;
    },
    daysToExpiry() {
      const oneDay = 24 * 60 * 60 * 1e3;
      const [year, month, day] = this.form.expiry.split('-');
      const today = new Date();
      const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
      return Math.round(Math.abs((today - expiryDate) / oneDay));
    },
    premiumDeposit() {
      return getPremiumDeposit(this.form.strike, this.price, this.daysToExpiry);
    }
  },
  methods: {
    ...mapActions(['login', 'approve', 'writeMintPotion', 'loadPotions']),
    async handleSubmit() {
      this.isLoading = true;
      if (this.isApproved) {
        this.isConfirmed = true;
        this.isLoading = false;
        const payload = {
          asset: this.form.asset,
          strike: this.form.strike,
          expiry: this.form.expiry,
          quantity: this.form.quantity,
          price: this.price,
          premium: this.premiumDeposit.toString()
        };
        await this.writeMintPotion(payload);
        await this.loadPotions();
        this.isCompleted = true;
      } else {
        await this.approve();
        this.isApproved = true;
        this.isLoading = false;
      }
    }
  },
  watch: {
    open() {
      this.autoPrice = true;
      this.price = this.currentPrice;
      this.isLoading = false;
      this.isConfirmed = false;
      this.isCompleted = false;
    },
    autoPrice(value) {
      if (value) this.price = this.currentPrice;
    }
  },
  created() {
    const daiAddress = process.env.VUE_APP_DAI_ADDRESS;
    const daiAllowance = parseFloat(this.settings.allowances[daiAddress] || '0');
    this.isApproved = !!daiAllowance;
  }
};
</script>
