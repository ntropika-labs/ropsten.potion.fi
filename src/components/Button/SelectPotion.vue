<template>
  <span>
    <a class="input" @click="modalOpen = true">
      <span v-if="input">
        {{ input.asset }}, strike price: ${{ $n(input.mintSprice) }} ({{ input.expiry | formatTs }})
      </span>
      <template v-else>Your potions ({{ potions.length }})</template>
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
      modalOpen: false,
      potions: this.$store.state.settings.potions
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
