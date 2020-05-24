<template>
  <span>
    <a class="input" @click="modalOpen = true">
      <Ticker v-if="input" :id="input" />
      <template v-else>Asset</template>
    </a>
    <ModalSelectToken :open="modalOpen" @close="modalOpen = false" @input="input = $event" />
  </span>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      input: null,
      modalOpen: false
    };
  },
  watch: {
    input(value) {
      this.$emit('input', value);
    },
    value(value) {
      this.input = value;
    }
  }
};
</script>
