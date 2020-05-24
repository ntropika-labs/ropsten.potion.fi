<template>
  <span>
    <a class="input" @click="modalOpen = true">
      <span v-if="input">
        Potion #{{ input.i + 1 }}:
        <Ticker :id="coingecko[input.asset]" type="short" class="ml-1" />
        at ${{ $n(input.mintSprice) }} on
        {{ input.expiry | formatTs }}
      </span>
      <template v-else>Your potions ({{ potions.length }})</template>
    </a>
    <ModalSelectPotion :open="modalOpen" @close="modalOpen = false" @input="input = $event" />
  </span>
</template>

<script>
import coingecko from '@/helpers/coingecko.json';

export default {
  props: ['value'],
  data() {
    return {
      input: '',
      modalOpen: false,
      potions: this.$store.state.settings.potions,
      coingecko
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
