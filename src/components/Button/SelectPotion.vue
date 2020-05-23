<template>
  <span>
    <a class="input" @click="modalOpen = true">
      <span v-if="input">
        {{ input.token }}, strike price: ${{ $n(input.strike) }} ({{ input.expiry }})
      </span>
      <template v-else>Your potions</template>
    </a>
    <ModalSelectPotion :open="modalOpen" @close="modalOpen = false" @input="input = $event" />
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
