<template>
  <section class="devices text-app-light">
    <h2 class="section-title mb-1">Devices</h2>
    <p class="section-hint mb-4">Where you are signed in. Each one stays signed in for 90 days after its last visit.</p>

    <div v-if="listError" class="section-error mb-2">{{ listError }}</div>
    <div v-else-if="loading && !sessions.length" class="section-hint mb-4">Loading devices…</div>

    <div
      v-for="session in sortedSessions"
      :key="getSessionId(session)"
      class="device d-flex align-center mb-2"
    >
      <div class="device-details flex-grow-1">
        <div class="device-name">
          {{ getSessionDevice(session) }}
          <span v-if="session.current" class="this-device ml-1">This device</span>
        </div>
        <div class="device-meta">{{ describeSessionUsage(session) }}</div>
      </div>
      <v-btn
        variant="text"
        size="small"
        color="app-light"
        class="flex-shrink-0"
        :aria-label="`Sign out ${session.current ? 'of this device' : getSessionDevice(session)}`"
        @click="openSignOut(session)"
      >
        Sign out
      </v-btn>
    </div>

    <v-btn
      v-if="hasOtherSessions"
      variant="outlined"
      color="app-light"
      rounded
      block
      class="sign-out-others mt-4"
      @click="openSignOut(null)"
    >
      Sign out of all other devices
    </v-btn>
  </section>

  <v-dialog v-model="signOutDialog.isOpen" max-width="400">
    <v-card class="pa-4">
      <v-card-text class="px-0">{{ signOutDialog.question }}</v-card-text>
      <div v-if="signOutDialog.error" class="mb-2 section-error">{{ signOutDialog.error }}</div>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          :disabled="signOutDialog.pending"
          @click="signOutDialog.isOpen = false"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="flat"
          color="app-dark"
          :loading="signOutDialog.pending"
          @click="confirmSignOut"
        >
          Sign out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchSessions, revokeOtherSessions, revokeSession } from '@/services/sessionsService'
import {
  SIGN_OUT_OTHERS_QUESTION,
  describeSessionUsage,
  getSessionDevice,
  getSessionId,
  getSessionsErrorMessage,
  getSignOutQuestion,
  isAlreadySignedOut,
  sortSessions
} from '@/utils/sessions.utils'

// This device signs out the way the page's Sign out button does, which also
// clears the cookie and the stores, so the page does it
const emit = defineEmits(['sign-out'])

const sessions = ref([])
const loading = ref(false)
const listError = ref('')

const sortedSessions = computed(() => sortSessions(sessions.value))
const hasOtherSessions = computed(() => sessions.value.some((session) => !session.current))

async function loadSessions() {
  loading.value = true
  listError.value = ''

  try {
    sessions.value = await fetchSessions()
  } catch (error) {
    console.error('[SignedInDevices] list', error)
    listError.value = getSessionsErrorMessage(error, 'load your devices')
  } finally {
    loading.value = false
  }
}

// `session` is null for "all other devices"
const signOutDialog = reactive({ isOpen: false, session: null, question: '', pending: false, error: '' })

function openSignOut(session) {
  Object.assign(signOutDialog, {
    isOpen: true,
    session,
    question: session ? getSignOutQuestion(session) : SIGN_OUT_OTHERS_QUESTION,
    pending: false,
    error: ''
  })
}

async function confirmSignOut() {
  const { session } = signOutDialog

  if (session?.current) {
    signOutDialog.isOpen = false
    emit('sign-out')

    return
  }

  signOutDialog.pending = true
  signOutDialog.error = ''

  try {
    await (session ? revokeSession(getSessionId(session)) : revokeOtherSessions())
    signOutDialog.isOpen = false
  } catch (error) {
    if (session && isAlreadySignedOut(error)) {
      signOutDialog.isOpen = false
    } else {
      console.error('[SignedInDevices] sign out', error)
      signOutDialog.error = getSessionsErrorMessage(error, 'sign out')
    }
  } finally {
    signOutDialog.pending = false
  }

  await loadSessions()
}

onMounted(loadSessions)
</script>

<style scoped lang="scss">
.devices {
  border-top: 1px solid rgba(246, 253, 235, 0.4);
  margin: 16px 1rem 0;
  padding-top: 24px;
}

.section-title {
  font-weight: 400;
  font-size: 24px;
  line-height: 28px;
}

.section-hint {
  font-size: 14px;
  opacity: 0.9;
}

// The warm tone of the site's refusals, readable on the page gradient and in the dialog
.section-error {
  font-size: 14px;
  color: #3f3d36;
  background: #f4a261;
  border-radius: 12px;
  padding: 8px 12px;
}

.device {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 10px 8px 10px 20px;
  min-height: 48px;
}

.device-name {
  font-size: 18px;
  word-break: break-word;
}

.this-device {
  font-size: 12px;
  color: #5f5b53;
  background: #ffda4c;
  border-radius: 10px;
  padding: 2px 8px;
  white-space: nowrap;
  vertical-align: middle;
}

.device-meta {
  font-size: 13px;
  opacity: 0.9;
}

.sign-out-others {
  min-height: 48px;
  text-transform: none;
  font-size: 16px;
}
</style>
