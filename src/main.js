import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components: {
    VTextField,
    VBtn,
    VIcon,
    VImg,
    VDialog,
    VCard
  },
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          'app-light': '#F6FDEB',
          'app-green-darker': '#CAE39D',
          'app-green-lighter': '#A7C76C',
          'app-yellow-darker': '#E1D165',
          'app-yellow-lighter': '#FFDA4D',
          'app-dark': '#5F5B53',
          'app-link': '#ffda4c'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

import validationPlugin from '@/plugins/validation.plugin'
import { VBtn, VCard, VDialog, VIcon, VImg, VTextField } from 'vuetify/components'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(validationPlugin)
app.use(vuetify)

app.mount('#app')
