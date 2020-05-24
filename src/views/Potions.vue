<template>
  <div class="block">
    <img src="~/@/assets/logo.svg" class="mb-2" />
    <h2 class="mb-4">Manage your potions</h2>
    <p class="mb-6">Drink a potion to exercise your funds or withdraw your ingredients.</p>
    <div class="form" v-if="potions.length > 0">
      <ButtonSelectPotion v-model="form.potion" class="mb-6 d-block" />
      <button
        v-if="form.potion && parseFloat(form.potion.amountRev) > 0"
        class="button button-primary mb-2"
        :disabled="!form.potion"
        @click="modalWithdrawOpen = true"
      >
        Withdraw
      </button>
      <button
        class="button button-primary mb-2"
        :disabled="!form.potion"
        @click="modalRevitalizeOpen = true"
        v-else
      >
        Exercise me!
      </button>
    </div>
    <ModalLogin :open="modalLoginOpen" @close="modalLoginOpen = false" />
    <ModalRevitalize
      :open="modalRevitalizeOpen"
      :form="form"
      @close="modalRevitalizeOpen = false"
    />
    <ModalWithdraw :open="modalWithdrawOpen" :form="form" @close="modalWithdrawOpen = false" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        potion: ''
      },
      modalWithdrawOpen: false,
      modalLoginOpen: false,
      modalRevitalizeOpen: false,
      potions: this.$store.state.settings.potions
    };
  }
};
</script>
