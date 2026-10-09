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
          <span class="label-text mb-1">Active trip tag</span>
          <v-text-field
            v-model="activeTagInput"
            placeholder="e.g. japan-2026"
            prefix="#"
            bg-color="transparent"
            class="form-element form-element-input text-app-light"
            variant="outlined"
            hide-details="auto"
            :error-messages="activeTagError"
            :disabled="activeTagSaving"
            @keydown.enter.prevent="saveActiveTag(activeTagInput)"
          />
        </label>
        <div class="active-tag-hint text-app-light mt-2">
          <template v-if="user?.activeTag">Every new expense gets #{{ user.activeTag }}</template>
          <template v-else>No active tag</template>
        </div>
        <div class="d-flex mt-3 active-tag-actions">
          <app-button
            class="flex-grow-1"
            :loading="activeTagSaving"
            :disabled="activeTagSaving || !normalizeTag(activeTagInput) || normalizeTag(activeTagInput) === user?.activeTag"
            @click="saveActiveTag(activeTagInput)"
          >
            Set
          </app-button>
          <app-button
            class="flex-grow-1"
            :disabled="activeTagSaving || !user?.activeTag"
            @click="saveActiveTag(null)"
          >
            Clear
          </app-button>
        </div>
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
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import InnerPageLayout from '@/layouts/InnerPageLayout.vue'
import AppButton from '@/components/AppButton.vue'
import { storeToRefs } from 'pinia'
import useUserStore from '@/stores/user'
import sendRequest from '@/api/sendRequest'
import { refreshSession } from '@/api/http'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router/router.constants'
import { setActiveTag } from '@/services/tagsService'
import { normalizeTag } from '@/utils/tags.utils'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const router = useRouter()

const activeTagInput = ref(user.value?.activeTag ?? '')
const activeTagSaving = ref(false)
const activeTagError = ref('')

// The user can arrive after this page is created (refresh on a page load)
watch(
  () => user.value?.activeTag,
  (activeTag) => {
    activeTagInput.value = activeTag ?? ''
  }
)

async function saveActiveTag(tag) {
  activeTagSaving.value = true
  activeTagError.value = ''

  try {
    // The API answers the full user; merging keeps the store whole even if a field is left out
    userStore.setUser({ ...user.value, ...(await setActiveTag(tag)) })
  } catch (err) {
    console.error('[ProfilePage] active-tag', err)
    activeTagError.value = 'Could not save the tag. Please try again.'
  } finally {
    activeTagSaving.value = false
  }
}

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
      url: '/api/telegram/telegram-binding-link',
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

// Linking finishes in Telegram, so the bot's change only shows up once
// the user is fetched again on coming back to this tab. Focus covers linking
// on the phone while this tab stays visible on the desktop
async function refetchUserAfterLinking() {
  if (document.visibilityState !== 'visible' || !bindingLink.value || user.value?.telegramId) {
    return
  }

  try {
    await refreshSession()
  } catch {
    // The session has been cleared, the same as a failed refresh anywhere else
    router.push({ name: ROUTE_NAMES.SIGN_IN })
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', refetchUserAfterLinking)
  window.addEventListener('focus', refetchUserAfterLinking)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', refetchUserAfterLinking)
  window.removeEventListener('focus', refetchUserAfterLinking)
})
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

.active-tag-hint {
  font-size: 14px;
  opacity: 0.9;
}

.active-tag-actions {
  gap: 12px;
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
