<template>
  <nav>
    <div class="bg-topnav">
      <div class="container-lg p-responsive d-flex">
        <div class="flex-auto text-left">
          <router-link :to="{ name: 'home' }">
            <h1 class="py-4">
              <img src="~/@/assets/logo.svg" />
              Potion
            </h1>
          </router-link>
        </div>
        <div class="py-4">
          <a v-if="address" class="button button-info">
            <span class="login-bullet mr-2 ml-n2" /> {{ name || shorten(address) }}
          </a>
          <a v-else class="button button-primary" @click="modalLoginOpen = true">
            Connect wallet
          </a>
        </div>
      </div>
      <div class="pt-4 pb-10">
        <h1 class="mx-auto container-md p-responsive">
          Welcome crypto-magician, protect your fund with hedge potions.
        </h1>
      </div>
    </div>
    <div class="mb-4 mt-n4">
      <div class="mainnav">
        <router-link :to="{ name: 'home' }" class="button button-secondary">
          Get potion
        </router-link>
        <router-link :to="{ name: 'potions' }" class="button button-secondary">
          My potions
        </router-link>
      </div>
    </div>
    <ModalLogin :open="modalLoginOpen" @close="modalLoginOpen = false" />
  </nav>
</template>

<script>
import { mapState } from 'vuex';
import { shorten } from '@/helpers/utils';

export default {
  data() {
    return {
      modalLoginOpen: false
    };
  },
  computed: mapState({
    name: state => state.settings.name,
    address: state => state.settings.address
  }),
  methods: {
    shorten
  }
};
</script>
