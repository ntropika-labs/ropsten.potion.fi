<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="mb-5">Select potion</h2>
      <a
        class="d-block py-3 px-4 text-left highlight d-flex"
        v-for="(potion, i) in settings.potions"
        :key="i"
        @click="select(potion, i)"
      >
        <div class="flex-auto">
          <h3 class="mb-2">Potion #{{ i + 1 }}</h3>
          <div class="mb-1">
            <b class="mr-2">Asset:</b> <Ticker :id="coingecko[potion.asset]" />
          </div>
          <div class="mb-1"><b class="mr-2">Strike price:</b> ${{ $n(potion.mintSprice) }}</div>
          <div class="mb-1"><b class="mr-2">Expiry date:</b> {{ potion.expiry | formatTs }}</div>
        </div>
      </a>
    </div>
  </Modal>
</template>

<script>
import { mapState } from 'vuex';
import coingecko from '@/helpers/coingecko.json';

export default {
  props: ['open'],
  data() {
    return {
      input: '',
      coingecko
    };
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    select(value, i) {
      value.i = i;
      this.$emit('input', value);
      this.$emit('close');
    }
  }
};
</script>
