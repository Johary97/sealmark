import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

// Tokens des thèmes (scopés via :root[data-theme-slug="..."], inactifs sauf pour le thème actif)
import '@themes/notary-office/tokens.css'
import '@themes/crypto-vault/tokens.css'
import '@themes/hand-signed/tokens.css'

createApp(App).mount('#app')
