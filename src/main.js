import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n/index.js'
import './styles/main.css'

// Tokens scopés par :root[data-theme-slug="..."] — seul le thème actif s'applique.
import '@themes/notary-office/tokens.css'
import '@themes/crypto-vault/tokens.css'
import '@themes/hand-signed/tokens.css'

createApp(App).use(i18n).mount('#app')
