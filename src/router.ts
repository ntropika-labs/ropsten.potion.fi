import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/Home.vue';
import Potions from '@/views/Potions.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  { path: '/', name: 'home', component: Home },
  { path: '/potions', name: 'potions', component: Potions }
];

const router = new VueRouter({
  routes
});

export default router;
