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
          <template v-if="user?.telegramId">
            <v-text-field
              :model-value="user.telegramId"
              placeholder="Telegram ID"
              bg-color="transparent"
              class="form-element form-element-input text-app-light"
              variant="outlined"
              hide-details="auto"
              readonly
            />
          </template>
          <template v-else>
            <app-button
              v-if="!bindingLink"
              class="telegram-link-button"
              :loading="bindingLinkLoading"
              :disabled="bindingLinkLoading"
              @click="fetchTelegramBindingLink"
            >
              Link Account
            </app-button>
            <div
              v-if="bindingLink"
              class="binding-link-block mt-3"
            >
              <span class="binding-link-label">Open in Telegram (expires in {{ bindingLinkExpires }} min):</span>
              <a
                :href="bindingLink"
                target="_blank"
                rel="noopener noreferrer"
                class="binding-link-url"
              >{{ bindingLink }}</a>
            </div>
          </template>
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
import { ref } from 'vue'
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import AppButton from '@/components/AppButton.vue'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/user'
import sendRequest from '@/api/sendRequest'

const { user } = storeToRefs(useUserStore())

const bindingLinkLoading = ref(false)
const bindingLink = ref('')
const bindingLinkExpires = ref(null)

async function fetchTelegramBindingLink() {
  if (bindingLinkLoading.value) return
  bindingLinkLoading.value = true
  bindingLink.value = ''
  bindingLinkExpires.value = null
  try {
    const data = await sendRequest({
      url: '/api/auth/telegram-binding-link',
      method: 'get',
    })
    bindingLink.value = data.link
    bindingLinkExpires.value = data.expiresInMinutes ?? null
  } catch (err) {
    console.error('[ProfilePage] telegram-binding-link', err)
  } finally {
    bindingLinkLoading.value = false
  }
}
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

.telegram-link-button {
  min-height: 48px;
  border-radius: 26px;
}

.binding-link-block {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.binding-link-label {
  font-size: 14px;
  color: #f6fdeb;
  opacity: 0.9;
}

.binding-link-url {
  font-size: 16px;
  color: #ffda4c;
  word-break: break-all;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
