<template>
  <Modal :open="open" @close="$emit('close')">
    <div>
      <h2 class="mb-5">Select potion</h2>
      <a
        class="d-block p-3 text-left"
        v-for="potion in potions"
        :key="potion"
        @click="select(potion)"
      >
        <p>{{ potion }}</p>
      </a>
    </div>
  </Modal>
</template>

<script>
const potions = [
  'Position on ETH strike $200 September 2020',
  'Position on Gold strike $1,600 August 2020',
  'Position on BTC strike $9,400 July 2020'
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
