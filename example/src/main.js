import { createApp } from 'vue';
import App from './App.vue';

import './assets/main.css';

import plugin from 'authorizer-vue';
createApp(App).use(plugin).mount('#app');
