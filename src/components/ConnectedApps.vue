<template>
  <section class="connected-apps text-app-light">
    <h2 class="section-title mb-1">Connected apps</h2>
    <p class="section-hint mb-4">Apps you allowed to read your expenses, and maybe add new ones.</p>

    <div v-if="listError" class="section-error mb-2">{{ listError }}</div>
    <div v-else-if="loading && !grants.length" class="section-hint mb-4">Loading apps…</div>
    <div v-else-if="!grants.length" class="section-hint mb-4">No apps connected</div>

    <div
      v-for="grant in sortedGrants"
      :key="getGrantId(grant)"
      class="app d-flex align-center mb-2"
    >
      <div class="app-details flex-grow-1">
        <div class="app-name">{{ getGrantClientName(grant) }}</div>
        <div class="app-meta">{{ describeGrantScopes(grant.scopes) }}</div>
        <div class="app-meta">{{ describeGrantUsage(grant) }}</div>
      </div>
      <v-btn
        variant="text"
        size="small"
        color="app-light"
        class="flex-shrink-0"
        :aria-label="`Disconnect ${getGrantClientName(grant)}`"
        @click="openDisconnection(grant)"
      >
        Disconnect
      </v-btn>
    </div>

    <div class="how-to mt-6">
      <h3 class="how-to-title mb-2">How to connect Claude</h3>
      <ol class="how-to-steps mb-3">
        <li>In claude.ai, open Settings → Connectors</li>
        <li>Choose Add custom connector and paste this URL:</li>
      </ol>
      <div class="d-flex align-center url-row">
        <code class="mcp-url flex-grow-1">{{ MCP_URL }}</code>
        <v-btn
          :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          variant="text"
          size="small"
          color="app-light"
          aria-label="Copy the connector URL"
          @click="copyUrl"
        ></v-btn>
      </div>
      <p class="section-hint mt-3 mb-0">
        Then sign in with your Wanna Track account. Allow adding expenses only if you want Claude to
        record them for you.
      </p>
    </div>
  </section>

  <v-dialog v-model="disconnection.isOpen" max-width="400">
    <v-card class="pa-4">
      <v-card-text class="px-0">{{ disconnection.question }}</v-card-text>
      <div v-if="disconnection.error" class="mb-2 section-error">{{ disconnection.error }}</div>
      <v-card-actions class="px-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          :disabled="disconnection.pending"
          @click="disconnection.isOpen = false"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="flat"
          color="app-dark"
          :loading="disconnection.pending"
          @click="confirmDisconnect"
        >
          Disconnect
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { disconnectApp, fetchConnectedApps } from '@/services/connectedAppsService'
import {
  describeGrantScopes,
  describeGrantUsage,
  getConnectedAppsErrorMessage,
  getDisconnectQuestion,
  getGrantClientName,
  getGrantId,
  getMcpUrl,
  isAlreadyDisconnected,
  sortGrants
} from '@/utils/connectedApps.utils'

const MCP_URL = getMcpUrl(import.meta.env.VITE_BASE_URL)

const grants = ref([])
const loading = ref(false)
const listError = ref('')

const sortedGrants = computed(() => sortGrants(grants.value))

async function loadGrants() {
  loading.value = true
  listError.value = ''

  try {
    grants.value = await fetchConnectedApps()
  } catch (error) {
    console.error('[ConnectedApps] list', error)
    listError.value = getConnectedAppsErrorMessage(error, 'load connected apps')
  } finally {
    loading.value = false
  }
}

const disconnection = reactive({ isOpen: false, id: null, question: '', pending: false, error: '' })

function openDisconnection(grant) {
  Object.assign(disconnection, {
    isOpen: true,
    id: getGrantId(grant),
    question: getDisconnectQuestion(grant),
    pending: false,
    error: ''
  })
}

async function confirmDisconnect() {
  disconnection.pending = true
  disconnection.error = ''

  try {
    await disconnectApp(disconnection.id)
    disconnection.isOpen = false
  } catch (error) {
    if (isAlreadyDisconnected(error)) {
      disconnection.isOpen = false
    } else {
      console.error('[ConnectedApps] disconnect', error)
      disconnection.error = getConnectedAppsErrorMessage(error, 'disconnect the app')
    }
  } finally {
    disconnection.pending = false
  }

  await loadGrants()
}

const copied = ref(false)

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(MCP_URL)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    // The URL stays on screen to copy by hand
    console.warn('[ConnectedApps] copy', error)
  }
}

onMounted(loadGrants)
</script>

<style scoped lang="scss">
.connected-apps {
  border-top: 1px solid rgba(246, 253, 235, 0.4);
  margin: 16px 1rem 32px;
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

.app {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 10px 8px 10px 20px;
  min-height: 48px;
}

.app-name {
  font-size: 18px;
  word-break: break-word;
}

.app-meta {
  font-size: 13px;
  opacity: 0.9;
}

.how-to-title {
  font-weight: 400;
  font-size: 18px;
}

.how-to-steps {
  font-size: 15px;
  padding-left: 20px;
}

.url-row {
  border: 1px solid #f6fdeb;
  border-radius: 26px;
  padding: 4px 4px 4px 16px;
}

.mcp-url {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  word-break: break-all;
  user-select: all;
}
</style>
