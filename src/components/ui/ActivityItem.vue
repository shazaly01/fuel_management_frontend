<template>
  <div class="flex items-start gap-3">
    <div class="flex-shrink-0 pt-1">
      <component :is="activity.icon" class="w-5 h-5" :class="activity.color" />
    </div>

    <div>
      <p class="text-sm text-text-primary leading-tight" v-html="activity.message"></p>
      <p class="text-xs text-text-muted mt-0.5">{{ relativeTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
})

const activity = computed(() => {
  const deviceHtml = `<strong class="font-bold">${props.deviceName}</strong>`
  switch (props.status) {
    case 'active':
      return {
        icon: CheckCircleIcon,
        color: 'text-success',
        message: `تم تجديد ${deviceHtml}.`,
      }
    case 'expired':
      return {
        icon: XCircleIcon,
        color: 'text-danger',
        message: `انتهى اشتراك ${deviceHtml}.`,
      }
    case 'pending_check':
      return {
        icon: ClockIcon,
        color: 'text-warning',
        message: `${deviceHtml} الآن بانتظار المتابعة.`,
      }
    default:
      return {
        icon: ArrowPathIcon,
        color: 'text-info',
        message: `تم تحديث حالة ${deviceHtml}.`,
      }
  }
})

const relativeTime = computed(() => {
  const date = new Date(props.timestamp)
  const now = new Date()
  const seconds = Math.round((now - date) / 1000)

  if (seconds < 60) return `الآن`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.round(hours / 24)
  return `منذ ${days} يوم`
})
</script>
