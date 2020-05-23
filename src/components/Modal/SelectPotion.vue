<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="mb-5">Select potion</h2>
      <a
        class="d-block py-3 px-4 text-left highlight d-flex"
        v-for="(potion, i) in potions"
        :key="i"
        @click="select(potion)"
      >
        <img :src="require(`@/assets/${potion.token}.png`)" height="40" class="mr-3" />
        <div class="flex-auto">
          <div class="mb-1">
            <b>{{ potion.token }}</b>
          </div>
          ${{ $n(potion.strike) }}
        </div>
        <p class="mt-2" v-text="potion.expiry" />
      </a>
    </div>
  </Modal>
</template>

<script>
const potions = [
  {
    token: 'BTC',
    strike: 10000,
    expiry: 'September 2020'
  },
  {
    token: 'ETH',
    strike: 200,
    expiry: 'August 2020'
  },
  {
    token: 'LINK',
    strike: 2,
    expiry: 'July 2020'
  }
];

export default {
  props: ['open'],
  data() {
    return {
      input: '',
      potions
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
