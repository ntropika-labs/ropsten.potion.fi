<template>
  <span>
    <img
      :src="require(`@/assets/${assets[id].ticker}.png`)"
      height="22"
      class="mr-1 mt-n1 v-align-middle"
    />
    <template v-if="type === 'short'">
      {{ assets[id].ticker }}
    </template>
    <template v-else>
      {{ assets[id].name }}
      ({{ assets[id].ticker }})
    </template>
  </span>
</template>

<script>
import assets from '@/helpers/assets.json';

export default {
  props: ['id', 'form', 'type'],
  data() {
    return { assets };
  }
};
</script>
