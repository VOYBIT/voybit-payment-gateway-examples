<script setup>
import { ref } from 'vue'

const props = defineProps({
  orderId: { type: String, required: true },
})

const loading = ref(false)
const errorMessage = ref('')

async function startCheckout() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('/api/checkout/crypto', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: props.orderId,
      }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok || typeof body.checkout_url !== 'string') {
      throw new Error(body?.error?.message || 'Checkout could not be started')
    }
    window.location.assign(body.checkout_url)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Checkout could not be started'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button type="button" :disabled="loading" @click="startCheckout">
    {{ loading ? 'Opening checkout…' : 'Pay' }}
  </button>
  <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
</template>
