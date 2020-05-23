<template>
  <Modal :open="open" @close="$emit('close')">
    <div>
      <h2 class="mb-5">Select asset</h2>
      <a
        class="d-block p-3 text-left"
        v-for="token in tokens"
        :key="token"
        @click="select(token)"
      >
        <h3>{{ token }}</h3>
      </a>
    </div>
  </Modal>
</template>

<script>
const tokens = [
  'BTC',
  'Gold',
  'Tesla'
];

export default {
  props: ['open'],
  data() {
    return {
      input: '',
      tokens
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
