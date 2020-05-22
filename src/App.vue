<template>
  <div id="app" class="overflow-hidden pb-6">
    <Nav />
    <VueLoadingIndicator v-if="settings.loading" class="big" />
    <router-view v-else :key="$route.path" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    ...mapActions(['init'])
  },
  created() {
    this.init();
  }
};
</script>
