<template>
  <div class="block">
    <img src="~/@/assets/logo.svg" class="mb-2" />
    <h2 class="mb-4">Protective potion</h2>
    <p class="mb-6">Select your ingredients and make recipe.</p>
    <form @submit.prevent="handleSubmit" class="form">
      <div class="mb-4">
        <ButtonSelectToken class="d-block mb-4" v-model="form.asset" />
        <input type="number" class="input mb-4" placeholder="Quantity" v-model="form.quantity" />
        <div class="d-flex">
          <div class="col-6 mr-2">
            <input
              type="number"
              class="input mb-4"
              placeholder="Strike price"
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
      return this.form.asset && this.form.quantity && this.form.strike && this.form.expiry;
    }
  },
  methods: {
    handleSubmit() {
      this.modalMakePotionOpen = true;
    }
  }
};
</script>
