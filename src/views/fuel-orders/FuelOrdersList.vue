<template>
  <div>
    <!-- رأس الصفحة والفلاتر -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة طلبات الوقود</h1>
      <div class="flex items-center space-x-2 space-x-reverse">
        <AppButton
          @click="printMovementOrder"
          variant="outline"
          class="bg-sky-500 text-white hover:bg-sky-600"
        >
          <!-- يمكنك استخدام أيقونة مناسبة هنا -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fill-rule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z"
              clip-rule="evenodd"
            />
          </svg>
          طباعة أمر الحركة
        </AppButton>
        <AppButton @click="openReportPrintPage" variant="outline">
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة التقرير
        </AppButton>
        <AppButton @click="openOrderModal()"> إضافة طلب </AppButton>
      </div>
    </div>
    <OrderReportFilters @apply-filters="applyFilters" @reset-filters="resetFilters" />

    <!-- استدعاء المكون الجديد وتمرير البيانات والأحداث إليه -->
    <FuelOrdersTable
      :items="fuelOrders"
      :pagination="pagination"
      :is-loading="loading"
      @edit-order="openOrderModal"
      @delete-order="openDeleteDialog"
      @print-order="openPrintPage"
      @page-change="handlePageChange"
    />

    <!-- النوافذ المنبثقة -->
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
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import FuelOrderModal from './FuelOrderModal.vue'
import OrderReportFilters from '@/views/reports/OrderReportFilters.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import FuelOrdersTable from './FuelOrdersTable.vue' // <-- المكون الجديد

// إعدادات
const router = useRouter()
const fuelOrderStore = useFuelOrderStore()
const { fuelOrders, loading, pagination } = storeToRefs(fuelOrderStore)
const toast = useToast()

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

const openReportPrintPage = () => {
  const cleanNumericFilters = Object.fromEntries(
    Object.entries(currentFilters.value).filter(
      ([key, v]) => v !== '' && v !== null && key !== 'page',
    ),
  )
  const routeData = router.resolve({
    name: 'FuelOrdersReportPrint',
    query: {
      ...cleanNumericFilters,
      printable: true,
    },
  })
  window.open(routeData.href, '_blank')
}

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

/**
 * يقوم بإنشاء وطباعة تقرير "أمر الحركة" بناءً على الفلاتر الحالية.
 */
const printMovementOrder = () => {
  // === [بداية التعديل هنا] ===
  // استخدم start_date من الفلاتر الحالية كتاريخ للتقرير
  const reportDate = currentFilters.value.start_date
  const companyId = currentFilters.value.company_id

  // 1. التحقق من وجود الفلاتر المطلوبة
  if (!reportDate || !companyId) {
    toast.error('يرجى تحديد تاريخ بداية وشركة من الفلاتر لطباعة أمر الحركة.')
    return
  }
  // === [نهاية التعديل هنا] ===

  // 2. بناء الرابط لصفحة الطباعة
  const routeData = router.resolve({
    name: 'MovementOrderPrint',
    query: {
      date: reportDate, // <-- نمرر التاريخ تحت اسم 'date' كما يتوقعه الـ API
      company_id: companyId,
    },
  })

  // 3. فتح صفحة الطباعة في تبويب جديد
  window.open(routeData.href, '_blank')
}
</script>
