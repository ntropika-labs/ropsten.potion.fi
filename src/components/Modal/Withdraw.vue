<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <img src="~/@/assets/top.svg" class="mb-2" />
      <h2 class="mb-5">Get your energy back</h2>
      <p class="mb-2">Your withdraw</p>
      <h1 class="text-primary mb-5">{{ form.potion.amountRev }} ETH</h1>
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
        <button
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
      await this.withdrawPotion(payload);
      this.$emit('close');
    }
  }
};
</script>
