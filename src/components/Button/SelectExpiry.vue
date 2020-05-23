<template>
  <span>
    <a class="input" @click="modalOpen = true">
      <span v-if="input" v-text="input" />
      <template v-else>Expiry date</template>
    </a>
    <ModalSelectExpiry :open="modalOpen" @close="modalOpen = false" @input="input = $event" />
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
