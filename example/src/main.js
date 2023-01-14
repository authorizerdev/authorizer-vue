import { createApp } from 'vue';
import 'authorizer-vue/library.css';
import authorizer from 'authorizer-vue/library.mjs';

import App from './App.vue';
import router from './router';
import './assets/main.css';

createApp(App).use(router).use(authorizer).mount('#app');
