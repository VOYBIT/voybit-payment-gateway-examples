<script setup>
const props = defineProps({
  orderId: { type: String, required: true },
})

async function pay() {
  const response = await $fetch('/api/checkout', {
    method: 'POST',
    body: { order_id: props.orderId },
  })
  if (typeof response?.checkout_url === 'string') {
    await navigateTo(response.checkout_url, { external: true })
  }
}
</script>

<template>
  <button type="button" @click="pay">Pay</button>
</template>
