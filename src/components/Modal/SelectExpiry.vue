<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body px-4">
      <h2 class="mb-5">Select expiry date</h2>
      <Calendar v-model="value" class="mb-6" />
      <div class="d-flex mb-2">
        <button class="button button-outline col-6 mr-2" @click="$emit('close')">Cancel</button>
        <button :disabled="!value" class="button button-primary col-6 ml-2" @click="select(value)">
          Confirm
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
export default {
  props: ['open'],
  data() {
    return {
      value: ''
    };
  },
  methods: {
    select(value) {
      this.$emit('input', value);
      this.$emit('close');
    }
  }
};
</script>
