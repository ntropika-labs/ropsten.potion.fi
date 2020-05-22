<template>
  <div class="block">
    <img src="~/@/assets/logo.svg" class="mb-2" />
    <h2 class="mb-4">Manage your potions</h2>
    <p class="mb-6">Drink a potion to revitalize your funds or withdraw your ingredients.</p>
    <form class="form" @submit.prevent="modalRevitalizeOpen = true">
      <select v-model="form.potion" class="input mb-6">
        <option value="">Your potions</option>
        <option value="1">Position on ETH strike 200 September 2020</option>
        <option value="2">Position on gold strike 1600 August 2020</option>
        <option value="3">Position on BTC strike 9400 July 2020</option>
      </select>
      <button class="button button-primary mb-2" :disabled="!form.potion">
        Revitalize me!
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
      modalRevitalizeOpen: false
    };
  }
};
</script>
