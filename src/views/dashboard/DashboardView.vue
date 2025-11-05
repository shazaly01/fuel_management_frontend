<!-- src/views/dashboard/DashboardView.vue (النسخة النهائية المصححة) -->
<template>
  <div>
    <!-- عنوان الصفحة -->
    <h1 class="text-3xl font-bold text-text-primary mb-6">لوحة التحكم</h1>

    <div v-if="error" class="p-4 text-center bg-danger/20 text-red-400 rounded-lg">
      <p>حدث خطأ أثناء تحميل بيانات لوحة التحكم.</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <div v-else>
      <!-- استخدام المسارات الصحيحة هنا -->
      <DashboardStatsCards :stats="dashboardStats" :is-loading="isLoading" />
      <DashboardInteractiveSummary :order-summary="orderSummary" :is-loading="isLoading" />
    </div>
  </div>
</template>

// src/views/dashboard/DashboardView.vue (تعديل في جزء script setup)

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'

import DashboardStatsCards from './DashboardStatsCards.vue'
import DashboardInteractiveSummary from './DashboardInteractiveSummary.vue'

const reportStore = useReportStore()
const { dashboardStats } = storeToRefs(reportStore)
const isLoading = ref(true)
const error = ref(null)

// --- [تم التعديل هنا] ---
// إضافة تحقق إضافي لضمان أن dashboardStats.value ليس null أو undefined
const orderSummary = computed(() => {
  if (!dashboardStats.value) {
    return []
  }
  // الآن بعد أن تأكدنا من وجوده، يمكننا الوصول إلى orders بأمان
  // هذا الكود سيعمل بشكل صحيح بعد تحديث الباك-إند
  return dashboardStats.value.orders || []
})
// --- [نهاية التعديل] ---

onMounted(async () => {
  isLoading.value = true
  error.value = null
  try {
    await reportStore.fetchDashboardStats()
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>
