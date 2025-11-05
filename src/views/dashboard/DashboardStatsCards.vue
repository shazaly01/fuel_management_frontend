<!-- src/components/dashboard/DashboardStatsCards.vue -->
<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- حالة التحميل: عرض الهياكل العظمية -->
    <template v-if="isLoading">
      <SkeletonCard v-for="i in 4" :key="`skeleton-${i}`" />
    </template>

    <!-- عرض البيانات الفعلية بعد التحميل -->
    <template v-else-if="stats">
      <StatCard
        title="إجمالي الشركات"
        :value="stats.general.companies"
        :icon="BuildingOffice2Icon"
        icon-bg-color="bg-sky-500/20"
        icon-color="text-sky-400"
      />
      <StatCard
        title="إجمالي السائقين"
        :value="stats.drivers.total"
        :icon="UsersIcon"
        icon-bg-color="bg-amber-500/20"
        icon-color="text-amber-400"
      />
      <StatCard
        title="السائقون المتاحون"
        :value="stats.drivers.available"
        :icon="CheckCircleIcon"
        icon-bg-color="bg-green-500/20"
        icon-color="text-green-400"
      />
      <StatCard
        title="طلبات مكتملة"
        :value="stats.orders.Delivered || 0"
        :icon="TruckIcon"
        icon-bg-color="bg-emerald-500/20"
        icon-color="text-emerald-400"
      />
    </template>
  </div>
</template>

<script setup>
import StatCard from '@/components/ui/StatCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import {
  BuildingOffice2Icon,
  UsersIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

// تعريف الـ props التي سيستقبلها المكون
defineProps({
  stats: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
})
</script>
