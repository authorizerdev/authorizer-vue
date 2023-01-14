import { createApp } from 'vue';
import plugin from 'authorizer-vue';

import App from './App.vue';
import router from './router';
import './assets/main.css';
import '../../dist/library.css';

createApp(App).use(router).use(plugin).mount('#app');
