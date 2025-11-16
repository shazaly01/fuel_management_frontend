<!-- src/views/dashboard/DashboardView.vue (النسخة النهائية الكاملة) -->
<template>
  <div>
    <!-- عنوان الصفحة -->
    <h1 class="text-3xl font-bold text-text-primary mb-6">لوحة التحكم</h1>

    <div v-if="error" class="p-4 text-center bg-danger/20 text-red-400 rounded-lg">
      <p>حدث خطأ أثناء تحميل بيانات لوحة التحكم.</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <div v-else>
      <DashboardStatsCards :stats="dashboardStats" :is-loading="isLoading" />

      <!-- ==================== [بداية التعديلات] ==================== -->
      <!-- 1. الاستماع للحدث @status-updated وتشغيل دالة refreshDashboardStats -->
      <DashboardInteractiveSummary
        :order-summary="orderSummary"
        :is-loading="isLoading"
        @status-updated="refreshDashboardStats"
      />
      <!-- ==================== [نهاية التعديلات] ==================== -->
    </div>
  </div>
</template>

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

const orderSummary = computed(() => {
  if (!dashboardStats.value) {
    return []
  }
  return dashboardStats.value.orders || []
})

// ==================== [بداية التعديلات] ====================

// 2. إنشاء دالة لإعادة جلب الإحصائيات
const refreshDashboardStats = async () => {
  try {
    // لا نعرض مؤشر التحميل الرئيسي، يمكن أن يكون تحديثًا صامتًا
    await reportStore.fetchDashboardStats()
  } catch (err) {
    console.error('Failed to refresh dashboard stats:', err)
    // يمكن عرض رسالة خطأ صغيرة هنا إذا أردت
  }
}

// ==================== [نهاية التعديلات] ====================

onMounted(async () => {
  isLoading.value = true
  error.value = null
  try {
    // استدعاء الدالة الجديدة عند التحميل الأولي أيضًا
    await refreshDashboardStats()
  } catch (err) {
    console.error('Failed to fetch dashboard stats:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>
