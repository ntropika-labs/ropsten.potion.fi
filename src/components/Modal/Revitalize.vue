<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <img src="~/@/assets/revitalize.svg" class="mb-2" />
      <h2 class="mb-4">Your revitalization</h2>
      <div class="text-left">
        <div class="border-bottom mb-5">
          <div class="mb-4">Strike price<span class="float-right">$123</span></div>
          <div class="mb-4">Expiry date<span class="float-right">August 2020</span></div>
          <div class="mb-5">Asset<span class="float-right">BTC</span></div>
        </div>
        <p class="mb-4">Please introduce the current price for your asset.</p>
        <div class="mb-5">
          <input type="number" class="input" placeholder="Price" v-model="form.price" />
        </div>
      </div>
      <h2 class="mb-4">Want to use?</h2>
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
        <button class="button button-primary col-6 ml-2" :disabled="!form.price">Confirm</button>
      </div>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open'],
  data() {
    return {
      form: {
        price: ''
      }
    };
  }
};
</script>
