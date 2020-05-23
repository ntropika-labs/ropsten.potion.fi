<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <img src="~/@/assets/top.svg" class="mb-2" />
      <h2 class="mb-5">Select wallet</h2>
      <button
        class="d-flex text-left mb-7 button button-select"
        @click="service = 'metamask'"
        :class="{ active: service === 'metamask' }"
      >
        <span class="flex-auto">MetaMask</span>
        <img src="~/@/assets/metamask.svg" height="30" class="mt-2 pt-1" />
      </button>
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
        <button class="button button-primary col-6 ml-2" @click="handleLogin" :disabled="!service">
          Confirm
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['open'],
  data() {
    return {
      service: ''
    };
  },
  methods: {
    ...mapActions(['login']),
    handleLogin() {
      this.login().then(() => this.$emit('close'));
    }
  }
};
</script>
