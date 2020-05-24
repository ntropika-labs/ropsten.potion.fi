<template>
  <span>
    {{ assets[id].name }}
    ({{ assets[id].ticker }})
  </span>
</template>

<script>
import assets from '@/helpers/assets.json';

export default {
  props: ['id', 'form'],
  data() {
    return { assets };
  }
};
</script>
