import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';

/* Ionic CSS */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Tailwind */
import './theme/tailwind.css';

/* Theme overrides */
import './theme/variables.css';

const pinia = createPinia();
const app = createApp(App);

app.use(IonicVue, {
  mode: 'ios', // iOS style for cleaner look
});
app.use(pinia);
app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});
