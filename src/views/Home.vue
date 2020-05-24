<template>
  <div class="block">
    <img src="~/@/assets/logo.svg" class="mb-2" />
    <h2 class="mb-4">Protective potion</h2>
    <p class="mb-6">Select your ingredients and make recipe.</p>
    <form @submit.prevent="handleSubmit" class="form">
      <div class="mb-4">
        <ButtonSelectToken class="d-block mb-4" v-model="form.asset" />
        <input
          type="number"
          class="input mb-4"
          placeholder="Quantity"
          step="0.001"
          v-model="form.quantity"
        />
        <div class="d-flex">
          <div class="col-6 mr-2">
            <input
              type="number"
              class="input mb-4"
              placeholder="Strike price"
              step="0.001"
              :max="maxStrike"
              v-model="form.strike"
            />
          </div>
          <div class="col-6 ml-2">
            <ButtonSelectExpiry v-model="form.expiry" />
          </div>
        </div>
      </div>
      <button
        v-if="settings.address"
        :disabled="!isValid"
        type="submit"
        class="button button-primary mb-2"
      >
        Make potion
      </button>
      <a v-else class="button button-primary mb-2" @click="modalLoginOpen = true">Connect wallet</a>
    </form>
    <ModalLogin :open="modalLoginOpen" @close="modalLoginOpen = false" />
    <ModalMakePotion
      v-if="isValid"
      :open="modalMakePotionOpen"
      :form="form"
      @close="modalMakePotionOpen = false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      form: {
        asset: '',
        quantity: '',
        strike: '',
        expiry: ''
      },
      modalLoginOpen: false,
      modalMakePotionOpen: false
    };
  },
  computed: {
    ...mapState(['settings']),
    isValid() {
      return (
        this.form.asset && parseFloat(this.form.quantity) && this.form.strike && this.form.expiry
      );
    },
    maxStrike() {
      const exchangeRate = this.settings.exchangeRates[this.form.asset];
      return exchangeRate && exchangeRate.usd ? exchangeRate.usd : 1e9;
    }
  },
  methods: {
    handleSubmit() {
      this.modalMakePotionOpen = true;
    }
  }
};
</script>
