import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VDatePicker } from 'vuetify/labs/components'

const vuetify = createVuetify({
  components: {
    ...components,
    VDatePicker
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

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(validationPlugin)
app.use(vuetify)

app.mount('#app')