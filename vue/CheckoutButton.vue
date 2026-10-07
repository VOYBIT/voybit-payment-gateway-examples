<script setup>
import { ref } from 'vue'

const props = defineProps({
  orderId: { type: String, required: true },
  assetId: { type: String, required: true },
})

const loading = ref(false)
const errorMessage = ref('')

async function startCryptoCheckout() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    // Call your own server. The Voybit API key never belongs in this file.
    const response = await fetch('/api/checkout/crypto', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: props.orderId,
        asset_id: props.assetId,
      }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok || typeof body.checkout_url !== 'string') {
      throw new Error(body?.error?.message || 'Could not start crypto checkout')
    }
    window.location.assign(body.checkout_url)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not start crypto checkout'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button type="button" :disabled="loading" @click="startCryptoCheckout">
    {{ loading ? 'Opening secure checkout…' : 'Pay with crypto' }}
  </button>
  <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
</template>
