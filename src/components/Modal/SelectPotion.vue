<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="mb-5">Select potion</h2>
      <a
        class="d-block py-3 px-4 text-left highlight d-flex"
        v-for="(potion, i) in settings.potions"
        :key="i"
        @click="select(potion)"
      >
        <img :src="require(`@/assets/${potion.asset}.png`)" height="40" class="mr-3" />
        <div class="flex-auto">
          <div class="mb-1">
            <b>{{ potion.asset }}</b>
          </div>
          ${{ $n(potion.mintSprice) }}
        </div>
        <p class="mt-2">{{ potion.expiry | formatTs }}</p>
      </a>
    </div>
  </Modal>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: ['open'],
  data() {
    return {
      input: ''
    };
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    select(value) {
      this.$emit('input', value);
      this.$emit('close');
    }
  }
};
</script>
