<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="mb-5">Select asset</h2>
      <a
        class="d-block py-3 px-4 text-left highlight d-flex"
        v-for="(token, i) in tokens"
        :key="i"
        @click="select(token.ticker)"
      >
        <img :src="require(`@/assets/${token.ticker}.png`)" height="40" class="mr-3" />
        <div>
          <div class="mb-1">
            <b>{{ token.name }}</b>
          </div>
          {{ token.ticker }}
        </div>
      </a>
    </div>
  </Modal>
</template>

<script>
const tokens = [
  { name: 'Bitcoin', ticker: 'BTC' },
  { name: 'Ethereum', ticker: 'ETH' },
  { name: 'Chainlink', ticker: 'LINK' },
  { name: 'Maker', ticker: 'MKR' },
  { name: 'Basic Attention Token', ticker: 'BAT' }
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
