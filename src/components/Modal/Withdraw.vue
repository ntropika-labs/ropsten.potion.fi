<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/top.svg" class="mb-2" />
      <h2 class="mb-5">Get your energy back</h2>
      <div v-if="step === 0">
        <p class="mb-2">Your withdraw</p>
        <h1 class="text-primary mb-5">{{ form.potion.collateralToWithdraw }} DAI</h1>
      </div>
      <div v-else-if="step > 0">
        <VueLoadingIndicator class="loading-lg mb-5" v-if="step === 1" />
        <img v-else src="~/@/assets/check.svg" height="118" class="mb-5" />
        <p class="mb-2">Your withdraw</p>
        <h2 class="mb-5">{{ form.potion.collateralToWithdraw }} DAI</h2>
      </div>
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2 mx-auto" @click="$emit('close')">
          Back to home
        </button>
        <button
          v-if="step === 0"
          class="button button-primary col-6 ml-2"
          @click="handleSubmit"
          :disabled="isLoading"
        >
          <VueLoadingIndicator v-if="isLoading" class="big" />
          <template v-else>Confirm</template>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['open', 'form'],
  data() {
    return {
      step: 0,
      isLoading: false,
      service: ''
    };
  },
  methods: {
    ...mapActions(['withdrawPotion']),
    async handleSubmit() {
      this.isLoading = true;
      const payload = {
        revitalID: this.form.potion.revitID,
        potionAddress: this.form.potion.contractAddress
      };
      this.step = 1;
      await this.withdrawPotion(payload);
      this.step = 2;
    }
  }
};
</script>
