<template>
  <inner-page-layout title="Profile">
    <v-form class="profile-content">
      <div class="form-element-wrapper mb-4">
        <label class="form-label text-app-light d-flex flex-column">
          <span class="label-text mb-1">Email</span>
          <v-text-field
            :model-value="user?.email ?? ''"
            placeholder="Email"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            readonly
          />
        </label>
      </div>

      <div class="form-element-wrapper mb-4">
        <label class="form-label text-app-light d-flex flex-column">
          <span class="label-text mb-1">Username</span>
          <v-text-field
            :model-value="user?.username ?? ''"
            placeholder="Username"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            readonly
          />
        </label>
      </div>

      <div class="form-element-wrapper mb-4">
        <label class="form-label text-app-light d-flex flex-column">
          <span class="label-text mb-1">Default currency</span>
          <v-text-field
            :model-value="user?.defaultCurrency ?? ''"
            placeholder="Default currency"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            readonly
          />
        </label>
      </div>

      <div class="form-element-wrapper mb-4">
        <label class="form-label text-app-light d-flex flex-column">
          <span class="label-text mb-1">Telegram ID</span>
          <v-text-field
            :model-value="user?.telegramId ?? ''"
            placeholder="Telegram ID"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            readonly
          />
        </label>
      </div>

      <div class="form-element-wrapper mb-4">
        <label class="form-label text-app-light d-flex flex-column">
          <span class="label-text mb-1">Verified</span>
          <v-text-field
            :model-value="user?.verified != null ? (user.verified ? 'Yes' : 'No') : ''"
            placeholder="Verified"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            readonly
          />
        </label>
      </div>
    </v-form>
  </inner-page-layout>
</template>

<script setup>
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/user'

const { user } = storeToRefs(useUserStore())
</script>

<style scoped lang="scss">
.profile-content {
  padding: 0 1rem;
}

.form-label {
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.1804px;
}

:deep(.v-input) {
  .v-field__input,
  .v-text-field__prefix {
    padding-top: 9px;
    padding-bottom: 9px;
    min-height: 48px;
    font-size: 18px;
  }
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
