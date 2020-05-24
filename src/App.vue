<template>
  <div id="app" class="overflow-hidden pb-6">
    <VueLoadingIndicator v-if="settings.loading" class="overlay big" />
    <div v-else>
      <Nav />
      <router-view :key="$route.path" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getBlackScholes } from '@/helpers/utils';

export default {
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    ...mapActions(['init'])
  },
  async created() {
    this.init();
    await getBlackScholes('bitcoin').then(blackScholes => console.log(blackScholes));
  }
};
</script>
