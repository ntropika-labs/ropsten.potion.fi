<template>
  <div class="block">
    <img src="~/@/assets/logo.svg" class="mb-2" />
    <h2 class="mb-4">Manage your potions</h2>
    <p class="mb-6">Drink a potion to exercise your funds or withdraw your ingredients.</p>
    <form class="form" @submit.prevent="modalRevitalizeOpen = true">
      <ButtonSelectPotion v-model="form.potion" class="mb-6 d-block" />
      <button class="button button-primary mb-2" :disabled="!form.potion">
        Exercise me!
      </button>
    </form>
    <ModalLogin :open="modalLoginOpen" @close="modalLoginOpen = false" />
    <ModalRevitalize
      :open="modalRevitalizeOpen"
      :form="form"
      @close="modalRevitalizeOpen = false"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        potion: ''
      },
      modalLoginOpen: false,
      modalRevitalizeOpen: false,
      potions: this.$store.state.settings.potions
    };
  }
};
</script>
