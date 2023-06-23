import { defineRule, Form as VeeForm, Field as VeeField } from 'vee-validate'
import { required, alpha_num, min, max, email, is } from '@vee-validate/rules'

export default {
  install(app) {
    app.component('VeeForm', VeeForm)
    app.component('VeeField', VeeField)

    defineRule('required', required)
    defineRule('alphaNum', alpha_num)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('email', email)
    defineRule('is', is)
  }
}
