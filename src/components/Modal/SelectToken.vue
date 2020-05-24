<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body">
      <h2 class="mb-5">Select asset</h2>
      <a
        class="d-block py-3 px-4 text-left highlight d-flex"
        v-for="(asset, i) in assets"
        :key="i"
        @click="select(i)"
      >
        <img :src="require(`@/assets/${asset.ticker}.png`)" height="40" class="mr-3" />
        <div>
          <div class="mb-1">
            <b>{{ asset.name }}</b>
          </div>
          {{ asset.ticker }}
        </div>
      </a>
    </div>
  </Modal>
</template>

<script>
import assets from '@/helpers/assets.json';

export default {
  props: ['open'],
  data() {
    return {
      input: '',
      assets
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
