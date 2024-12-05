<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import AppInputWithValidation from '@/components/AppInputWithValidation.vue'
import AppButton from '@/components/AppButton.vue'
import { useRequest } from '@/composables/useRequest'
import useUserStore from '@/stores/user'
import { useRouter } from 'vue-router'

const { loading, fetchData } = useRequest()
const router = useRouter()
const { user } = useUserStore()

const validationSchema = {
  name: 'required|min:3|max:200'
}

let fundName = null
let balance = null
let iconName = null
let description = null

const getIconByName = (name) => {
  if (!name) {
    return ''
  }

  return 'mdi-' + name
}

const createFund = async () => {
  const requestBody = {
    userId: user.id,
    name: fundName,
    description,
    initialBalance: balance || 0,
    icon: getIconByName(iconName)
  }

  await fetchData({
    url: '/api/funds',
    method: 'post',
    body: requestBody
  })

  fundName = null
  iconName = null

  router.back()
}
</script>

<template>
  <inner-page-layout title="Add New Fund">
    <vee-form :validation-schema="validationSchema" @submit="createFund">
      <v-form>
        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Name</span>
            <app-input-with-validation
              type="text"
              placeholder="Fund name"
              name="fundName"
              v-model="fundName"
              bg-color="transparent"
              class-name="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
            ></app-input-with-validation>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Description</span>
            <vee-field name="description" v-slot="{ field, errors }" v-bind="$attrs">
              <v-textarea
                type="text"
                placeholder="What is this fund for?"
                v-bind="field"
                name="description"
                class="form-element form-element-textarea bg-transparent text-app-light"
                variant="outlined"
                rows="3"
                hide-details="auto"
                :error-messages="errors"
              ></v-textarea>
            </vee-field>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Balance</span>
            <app-input-with-validation
              type="number"
              placeholder="Enter amount"
              name="balance"
              v-model="balance"
              bg-color="transparent"
              class-name="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
            ></app-input-with-validation>
          </label>
        </div>

        <div class="form-element-wrapper mb-4">
          <label class="form-label text-app-light d-flex flex-column">
            <span class="label-text mb-1">Icon</span>
            <span class="description-text mb-1">
              You can find an icon and use its name
              <a href="https://materialdesignicons.com/" target="_blank" class="text-app-light"
                >here</a
              >
            </span>
            <app-input-with-validation
              type="text"
              placeholder="Icon name"
              name="icon"
              v-model="iconName"
              bg-color="transparent"
              class-name="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
            ></app-input-with-validation>
          </label>
        </div>
      </v-form>

      <div class="d-flex align-center">
        <span class="form-label text-app-light label-text">Preview</span>
        <div class="text-center flex-grow-1">
          <v-icon :icon="getIconByName(iconName)" class="mr-2" color="#f6fdeb" size="40"></v-icon>
        </div>
      </div>

      <app-button class="mt-12" type="submit" :loading="loading" @click="createFund"
        >Save</app-button
      >
    </vee-form>
  </inner-page-layout>
</template>

<style scoped lang="scss">
.form-label {
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.1804px;

  .description-text {
    font-size: 16px;
    line-height: 20px;
  }
}

:deep(.v-input) {
  .v-field__input,
  .v-text-field__prefix {
    padding-top: 9px;
    padding-bottom: 9px;
    min-height: 48px;
    font-size: 18px;
  }
  /*
  There is an issue with border radius of outlined text-field
  So I have to remove default border
  and set my own
   */
  .v-field__outline {
    border: 1px solid #f6fdeb;
    border-radius: 26px !important;

    .v-field__outline__start,
    .v-field__outline__end {
      border: none !important;
    }
  }
}
</style>
