import { createApp } from 'vue';
import plugin from 'authorizer-vue';

import App from './App.vue';
import './assets/main.css';

createApp(App).use(plugin).mount('#app');
