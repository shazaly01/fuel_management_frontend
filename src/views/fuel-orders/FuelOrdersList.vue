<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة طلبات الوقود</h1>

      <!-- === [بداية التعديل هنا] === -->
      <div class="flex items-center space-x-2 space-x-reverse">
        <!-- زر طباعة التقرير الجديد -->
        <AppButton @click="openReportPrintPage" variant="outline">
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة التقرير
        </AppButton>
        <!-- زر إضافة طلب القديم -->
        <AppButton @click="openOrderModal()"> إضافة طلب </AppButton>
      </div>
      <!-- === [نهاية التعديل هنا] === -->
    </div>

    <!-- [جديد] إضافة مكون الفلاتر -->
    <OrderReportFilters @apply-filters="applyFilters" @reset-filters="resetFilters" />

    <!-- جدول عرض الطلبات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="fuelOrders || []"
        :is-loading="loading"
        @row-click="openOrderModal"
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

        <!-- عمود الإجراءات المعدل -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end space-x-2 space-x-reverse">
            <!-- زر طباعة الطلب الواحد -->
            <button
              @click.stop="openPrintPage(item.id)"
              class="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="طباعة الطلب"
            >
              <PrinterIcon class="w-5 h-5" />
            </button>

            <!-- فاصل بصري -->
            <div class="h-5 w-px bg-gray-200 dark:bg-gray-600"></div>

            <!-- الأزرار القديمة -->
            <button
              @click.stop="openOrderModal(item)"
              class="font-semibold text-blue-500 hover:text-blue-700 px-2"
            >
              تعديل
            </button>
            <button
              @click.stop="openDeleteDialog(item)"
              class="font-semibold text-danger hover:text-red-700 px-2"
            >
              حذف
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- النوافذ المنبثقة (Modals) -->
    <FuelOrderModal
      v-model="isModalOpen"
      :order="selectedOrder"
      :is-saving="isSaving"
      @save="handleSaveOrder"
    />
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الطلب"
      :message="`هل أنت متأكد من رغبتك في حذف الطلب رقم '${orderToDelete?.id}'؟`"
      @confirmed="deleteSelectedOrder"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFuelOrderStore } from '@/stores/fuelOrderStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import FuelOrderModal from './FuelOrderModal.vue'
import OrderReportFilters from '@/views/reports/OrderReportFilters.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'

// إعدادات
const router = useRouter()
const fuelOrderStore = useFuelOrderStore()
const { fuelOrders, loading, pagination } = storeToRefs(fuelOrderStore)
const toast = useToast()

// --- [بداية الكود الجديد] ---
// مرجع للوصول إلى مكون الفلاتر
const filtersComponent = ref(null)
// --- [نهاية الكود الجديد] ---

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'status', label: 'الحالة' },
  { key: 'driver', label: 'السائق' },
  { key: 'station', label: 'المحطة' },
  { key: 'product', label: 'المنتج' },
  { key: 'quantity', label: 'الكمية' },
  { key: 'order_date', label: 'تاريخ الطلب' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// منطق الفلاتر والترقيم
const currentFilters = ref({ page: 1 })

const applyFilters = (newFilters) => {
  currentFilters.value = { ...newFilters, page: 1 }
  fetchData()
}

const resetFilters = () => {
  currentFilters.value = { page: 1 }
  fetchData()
}

const handlePageChange = (page) => {
  currentFilters.value.page = page
  fetchData()
}

const fetchData = () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(currentFilters.value).filter(([_, v]) => v !== '' && v !== null),
  )
  fuelOrderStore.fetchFuelOrders(cleanFilters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الطلبات.')
  })
}

// دالة لفتح صفحة طباعة الطلب الواحد
const openPrintPage = (orderId) => {
  const routeData = router.resolve({
    name: 'FuelOrderPrint',
    params: { id: orderId },
  })
  window.open(routeData.href, '_blank')
}

// --- [بداية الكود الجديد والمُحدَّث] ---
const openReportPrintPage = () => {
  // 1. تنظيف الفلاتر الرقمية
  const cleanNumericFilters = Object.fromEntries(
    Object.entries(currentFilters.value).filter(
      ([key, v]) => v !== '' && v !== null && key !== 'page',
    ),
  )

  // 2. بناء الرابط مع الفلاتر الرقمية ومعامل الطباعة
  const routeData = router.resolve({
    name: 'FuelOrdersReportPrint',
    query: {
      ...cleanNumericFilters,
      printable: true,
    },
  })

  // 3. فتح الرابط في تبويب جديد
  window.open(routeData.href, '_blank')
}
// --- [نهاية الكود الجديد والمُحدَّث] ---

// جلب البيانات عند تحميل المكون
onMounted(() => {
  fetchData()
})

// منطق الحفظ (الإضافة والتعديل)
const isModalOpen = ref(false)
const selectedOrder = ref(null)
const isSaving = ref(false)

const openOrderModal = (order = null) => {
  selectedOrder.value = order
  isModalOpen.value = true
}

const handleSaveOrder = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await fuelOrderStore.updateFuelOrder(formData.id, formData)
      toast.success(`تم تعديل الطلب رقم '${formData.id}' بنجاح.`)
    } else {
      await fuelOrderStore.createFuelOrder(formData)
      toast.success(`تمت إضافة طلب جديد بنجاح.`)
    }
    fetchData()
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const orderToDelete = ref(null)

const openDeleteDialog = (order) => {
  orderToDelete.value = order
  isDeleteDialogOpen.value = true
}

const deleteSelectedOrder = async () => {
  if (orderToDelete.value) {
    try {
      await fuelOrderStore.deleteFuelOrder(orderToDelete.value.id)
      toast.success(`تم حذف الطلب رقم '${orderToDelete.value.id}' بنجاح.`)
      fetchData()
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      orderToDelete.value = null
    }
  }
}
</script>
