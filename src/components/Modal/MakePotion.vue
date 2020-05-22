<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <img src="~/@/assets/recipe.svg" class="mb-2" />
      <h2 class="mb-4">Your recipe</h2>
      <div class="text-left">
        <div class="border-bottom mb-5">
          <div class="mb-4">
            Strike price<span class="float-right">${{ form.strike }}</span>
          </div>
          <div class="mb-4">Expiry date<span class="float-right" v-text="form.expiry" /></div>
          <div class="mb-4">Asset<span class="float-right" v-text="form.asset" /></div>
          <div class="mb-4">
            Auto price
            <span class="float-right">
              <VueSwitch v-model="autoPrice" />
            </span>
          </div>
          <div class="mb-5 overflow-hidden">
            <div class="col-4 float-right">
              <input
                type="number"
                class="input"
                placeholder="Price"
                :value="settings.exchangeRates.bitcoin.usd"
              />
            </div>
          </div>
        </div>
        <div class="mb-4">Quantity<span class="float-right" v-text="form.quantity" /></div>
        <div class="mb-4">Price per potion<span class="float-right">5 DAI</span></div>
        <div class="mb-5 text-bold text-primary">
          Total price<span class="float-right">{{ form.quantity * 5 }} DAI</span>
        </div>
      </div>
      <h2 class="mb-4">Want to purchase?</h2>
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
        <button class="button button-primary col-6 ml-2" @click="handleLogin">Confirm</button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  props: ['open', 'form'],
  data() {
    return {
      autoPrice: true
    };
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    ...mapActions(['login']),
    handleLogin() {
      this.login().then(() => this.$emit('close'));
    }
  }
};
</script>
