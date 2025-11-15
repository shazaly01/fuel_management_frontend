<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="items"
      :is-loading="isLoading"
      @row-click="$emit('edit-order', $event)"
    >
      <!-- قوالب الخلايا المخصصة -->
      <template #cell-status="{ item }">
        <span
          v-if="item.status"
          class="px-3 py-1 text-sm font-semibold rounded-full text-white"
          :style="{ backgroundColor: item.status.color || '#6B7280' }"
        >
          {{ item.status.name }}
        </span>
      </template>

      <template #cell-driver="{ item }">
        <span>{{ item.driver?.name || 'غير محدد' }}</span>
      </template>

      <template #cell-station="{ item }">
        <span>{{ item.station?.name || 'غير محدد' }}</span>
      </template>

      <template #cell-product="{ item }">
        <span>{{ item.product?.name || 'غير محدد' }}</span>
      </template>

      <!-- عمود الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-2 space-x-reverse">
          <!-- زر طباعة الطلب الواحد -->
          <button
            @click.stop="$emit('print-order', item.id)"
            class="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="طباعة الطلب"
          >
            <PrinterIcon class="w-5 h-5" />
          </button>

          <!-- فاصل بصري -->
          <div class="h-5 w-px bg-gray-200 dark:bg-gray-600"></div>

          <!-- زر التعديل -->
          <button
            @click.stop="$emit('edit-order', item)"
            class="font-semibold text-blue-500 hover:text-blue-700 px-2"
          >
            تعديل
          </button>

          <!-- زر الحذف -->
          <button
            @click.stop="$emit('delete-order', item)"
            class="font-semibold text-danger hover:text-red-700 px-2"
          >
            حذف
          </button>
        </div>
      </template>
    </AppTable>

    <!-- الترقيم (يظهر فقط إذا تم تمرير بيانات الترقيم) -->
    <AppPagination
      v-if="pagination"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
    />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: { type: Array, required: true },
  pagination: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  // Prop جديد للتحكم في عرض عمود السائق
  showDriverColumn: { type: Boolean, default: true },
})

defineEmits(['edit-order', 'delete-order', 'print-order', 'page-change'])

// أعمدة الجدول أصبحت ديناميكية الآن
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'status', label: 'الحالة' },
  ]

  // إضافة عمود السائق بشكل مشروط
  if (props.showDriverColumn) {
    headers.push({ key: 'driver', label: 'السائق' })
  }

  headers.push(
    { key: 'station', label: 'المحطة' },
    { key: 'product', label: 'المنتج' },
    { key: 'quantity', label: 'الكمية' },
    { key: 'order_date', label: 'تاريخ الطلب' },
    { key: 'actions', label: 'إجراءات', class: 'text-left' },
  )

  return headers
})
</script>
