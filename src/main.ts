import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Pusher from 'pusher-js';
import rippleDirective from './directives/ripple'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

Pusher.logToConsole = true;

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(router);
app.use(pinia);

app.directive('ripple', rippleDirective);

app.mount('#app')
