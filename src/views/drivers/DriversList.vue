<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة السائقين</h1>
      <AppButton @click="openDriverModal()"> إضافة سائق </AppButton>
    </div>

    <!-- مكون الفلاتر -->
    <DriversFilters @filters-changed="applyFilters" />

    <!-- بطاقة المحتوى -->
    <AppCard>
      <!-- مكون الجدول -->
      <DriversTable
        :drivers="drivers"
        :is-loading="loading"
        @show-orders="openDriverOrdersModal"
        @delete="openDeleteDialog"
        @preview-image="openImagePreview"
        @create-order="openCreateOrderModal"
        @edit="openDriverModal"
      />

      <!-- مكون الترقيم -->
      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- النوافذ المنبثقة (Modal & Dialogs) -->

    <!-- نافذة إضافة/تعديل سائق -->
    <DriverModal
      v-model="isModalOpen"
      :driver="selectedDriver"
      :is-saving="isSaving"
      @save="handleSaveDriver"
    />

    <!-- نافذة إضافة طلبية وقود -->
    <FuelOrderModal
      v-model="isOrderModalOpen"
      :driver="selectedDriverForOrder"
      :is-saving="isOrderSaving"
      @save="handleSaveOrder"
    />

    <DriverOrdersModal v-model="isDriverOrdersModalOpen" :driver="selectedDriverForOrders" />
    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السائق"
      :message="`هل أنت متأكد من رغبتك في حذف السائق '${driverToDelete?.name}'؟`"
      @confirmed="deleteSelectedDriver"
    />

    <!-- نافذة عرض الصورة -->
    <ImagePreviewModal v-model="isImagePreviewOpen" :image-url="imageUrlToPreview" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import { useFuelOrderStore } from '@/stores/fuelOrderStore' // <-- 1. استيراد store الطلبيات
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import DriverModal from './DriverModal.vue'
import ImagePreviewModal from '@/components/ui/ImagePreviewModal.vue'
import DriversTable from './DriversTable.vue'
import DriversFilters from './DriversFilters.vue'
import FuelOrderModal from '@/views/fuel-orders/FuelOrderModal.vue' // <-- 2. استيراد نافذة الطلبيات
import DriverOrdersModal from './DriverOrdersModal.vue' // <-- استيراد المكون الجديد

// --- إعدادات Store والحالة ---
const driverStore = useDriverStore()
const { drivers, loading, pagination } = storeToRefs(driverStore)
const toast = useToast()

// --- منطق الفلاتر والبيانات (يبقى كما هو) ---
const currentFilters = ref({})

const fetchData = (page = 1) => {
  driverStore.fetchDrivers(page, currentFilters.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات السائقين.')
  })
}

const applyFilters = (filters) => {
  currentFilters.value = filters
  fetchData(1)
}

const handlePageChange = (page) => {
  fetchData(page)
}

onMounted(() => {
  fetchData(1)
})

// --- منطق نافذة تعديل/إضافة سائق (يبقى كما هو) ---
const isModalOpen = ref(false)
const selectedDriver = ref(null)
const isSaving = ref(false)

const openDriverModal = (driver = null) => {
  selectedDriver.value = driver
  isModalOpen.value = true
}

const handleSaveDriver = async (formData) => {
  isSaving.value = true
  try {
    const isFormData = formData instanceof FormData
    const driverId = isFormData ? formData.get('id') : formData.id
    const driverName = isFormData ? formData.get('name') : formData.name

    if (driverId) {
      await driverStore.updateDriver(driverId, formData)
      toast.success(`تم تعديل بيانات السائق '${driverName}' بنجاح.`)
    } else {
      await driverStore.createDriver(formData)
      toast.success(`تمت إضافة السائق '${driverName}' بنجاح.`)
    }
    await fetchData(pagination.value.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessages = error.response?.data?.errors
    if (errorMessages) {
      Object.values(errorMessages).forEach((msgArray) => {
        msgArray.forEach((msg) => toast.error(msg))
      })
    } else {
      toast.error('حدث خطأ أثناء حفظ البيانات.')
    }
  } finally {
    isSaving.value = false
  }
}

// --- منطق نافذة حذف سائق (يبقى كما هو) ---
const isDeleteDialogOpen = ref(false)
const driverToDelete = ref(null)

const openDeleteDialog = (driver) => {
  driverToDelete.value = driver
  isDeleteDialogOpen.value = true
}

const deleteSelectedDriver = async () => {
  if (driverToDelete.value) {
    try {
      await driverStore.deleteDriver(driverToDelete.value.id)
      await fetchData(pagination.value.current_page || 1)
      toast.success(`تم حذف السائق '${driverToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      driverToDelete.value = null
    }
  }
}

// --- منطق نافذة عرض الصورة (يبقى كما هو) ---
const isImagePreviewOpen = ref(false)
const imageUrlToPreview = ref('')

const openImagePreview = (url) => {
  imageUrlToPreview.value = url
  isImagePreviewOpen.value = true
}

// --- [بداية الكود الجديد] منطق نافذة إضافة طلبية ---
const fuelOrderStore = useFuelOrderStore() // 3. تهيئة store الطلبيات
const isOrderModalOpen = ref(false)
const selectedDriverForOrder = ref(null)
const isOrderSaving = ref(false)

/**
 * يفتح نافذة إضافة طلبية للسائق المحدد.
 * @param {object} driver - كائن السائق الذي تم اختياره.
 */
const openCreateOrderModal = (driver) => {
  selectedDriverForOrder.value = driver
  isOrderModalOpen.value = true
}

/**
 * يعالج عملية حفظ الطلبية الجديدة.
 * @param {object} formData - بيانات النموذج من FuelOrderForm.
 */
const handleSaveOrder = async (formData) => {
  isOrderSaving.value = true
  try {
    // في هذا السياق، نحن نقوم بالإنشاء فقط، لا يوجد تعديل
    await fuelOrderStore.createFuelOrder(formData)
    toast.success(`تمت إضافة طلبية جديدة للسائق '${selectedDriverForOrder.value.name}' بنجاح.`)
    await fetchData(pagination.value.current_page || 1) // إعادة تحميل بيانات السائقين لإظهار العدد المحدث
    isOrderModalOpen.value = false
  } catch (error) {
    // يمكنك إضافة معالجة أكثر تفصيلاً للأخطاء هنا إذا أردت
    toast.error('حدث خطأ أثناء حفظ الطلبية.')
  } finally {
    isOrderSaving.value = false
  }
}

// --- [جديد] نافذة عرض طلبيات السائق ---
const isDriverOrdersModalOpen = ref(false)
const selectedDriverForOrders = ref(null)

const openDriverOrdersModal = (driver) => {
  selectedDriverForOrders.value = driver
  isDriverOrdersModalOpen.value = true
}
</script>
