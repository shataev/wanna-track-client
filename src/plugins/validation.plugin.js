import { defineRule, Form as VeeForm, Field as VeeField, configure } from 'vee-validate'
import { required, alpha_num, min, max, email, is, min_value } from '@vee-validate/rules'

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
    defineRule('min_value', min_value)
    defineRule('min_expense_value', min_value)

    configure({
      generateMessage: (ctx) => {
        const messages = {
          required: `The field ${ctx.field} is required`,
          min: `The field ${ctx.field} is too short`,
          max: `The field ${ctx.field} is too long`,
          email: `The field ${ctx.field} must be a valid email`,
          min_value: `The field ${ctx.field} is too low`,
          password_mismatch: "The passwords don't match",
          min_expense_value: "The expense can't be less than 1"
        }

        const message = messages[ctx.rule.name]
          ? messages[ctx.rule.name]
          : `The field ${ctx.field} is invalid`

        return message
      },
      validateOnBlur: true,
      validateOnChange: true,
      validateOnInput: false,
      validateOnModelUpdate: true
    })
  }
}