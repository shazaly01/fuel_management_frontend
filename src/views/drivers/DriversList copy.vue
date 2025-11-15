<template>
  <div>
    <!-- رأس الصفحة (يبقى كما هو) -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة السائقين</h1>
      <AppButton @click="openDriverModal()"> إضافة سائق </AppButton>
    </div>

    <!-- جدول عرض السائقين -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="drivers || []"
        :is-loading="loading"
        @row-click="openDriverModal"
      >
        <!-- Slots المخصصة الحالية (تبقى كما هي) -->
        <template #cell-truck_details="{ item }">
          <div v-if="item.truck" class="text-sm">
            <ul class="list-disc list-inside">
              <li><strong>الرقم:</strong> {{ item.truck.truck_number }}</li>
              <li><strong>النوع:</strong> {{ item.truck.truck_type }}</li>
              <li><strong>المقطورة:</strong> {{ item.truck.trailer_number }}</li>
            </ul>
          </div>
          <span v-else class="text-gray-400">لا توجد شاحنة</span>
        </template>

        <template #cell-driver_details="{ item }">
          <div v-if="item.address || item.work_nature" class="text-sm">
            <ul class="list-disc list-inside space-y-1">
              <li v-if="item.address">
                <strong>العنوان:</strong>
                <span class="mr-1">{{ item.address }}</span>
              </li>
              <li v-if="item.work_nature">
                <strong>طبيعة العمل:</strong>
                <span class="mr-1">{{ item.work_nature.name }}</span>
              </li>
            </ul>
          </div>
          <span v-else class="text-gray-400">--</span>
        </template>

        <template #cell-status="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="statusClasses[item.status] || 'bg-gray-200 text-gray-800'"
          >
            {{ statusTranslations[item.status] || item.status }}
          </span>
        </template>

        <!-- --- بداية الإضافة: Slot مخصص لعمود المستند --- -->
        <template #cell-document="{ item }">
          <div v-if="item.document_image_url" class="flex justify-center">
            <button
              @click.stop="openImagePreview(item.document_image_url)"
              class="text-sky-500 hover:text-sky-400 transition-colors"
              title="عرض صورة المستند"
            >
              <!-- أيقونة مستند/صورة -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <div v-else class="flex justify-center">
            <span class="text-gray-400">-</span>
          </div>
        </template>
        <!-- --- نهاية الإضافة --- -->

        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openDriverModal(item)"
              class="font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              تعديل
            </button>
            <button
              @click.stop="openDeleteDialog(item)"
              class="font-medium text-rose-400 hover:text-rose-300 transition-colors"
            >
              حذف
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- النوافذ المنبثقة الحالية (تبقى كما هي) -->
    <DriverModal
      v-model="isModalOpen"
      :driver="selectedDriver"
      :is-saving="isSaving"
      @save="handleSaveDriver"
    />
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السائق"
      :message="`هل أنت متأكد من رغبتك في حذف السائق '${driverToDelete?.name}'؟`"
      @confirmed="deleteSelectedDriver"
    />

    <!-- --- بداية الإضافة: نافذة عرض الصورة --- -->
    <ImagePreviewModal v-model="isImagePreviewOpen" :image-url="imageUrlToPreview" />
    <!-- --- نهاية الإضافة --- -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import DriverModal from './DriverModal.vue'
// --- بداية الإضافة: استيراد مكون عرض الصورة ---
import ImagePreviewModal from '@/components/ui/ImagePreviewModal.vue'
// --- نهاية الإضافة ---

// إعدادات (تبقى كما هي)
const driverStore = useDriverStore()
const { drivers, loading, pagination } = storeToRefs(driverStore)
const toast = useToast()

// --- بداية التعديل: إضافة عمود "المستند" ---
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم السائق' },
  { key: 'phone_number', label: 'رقم الهاتف' },
  { key: 'truck_details', label: 'تفاصيل الشاحنة' },
  { key: 'driver_details', label: 'تفاصيل السائق' },
  { key: 'status', label: 'الحالة' },
  { key: 'document', label: 'المستند', class: 'text-center' }, // <-- العمود الجديد
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]
// --- نهاية التعديل ---

// ترجمات وتلوين الحالة (تبقى كما هي)
const statusTranslations = {
  available: 'متاح',
  on_trip: 'في رحلة',
  unavailable: 'غير متاح',
}
const statusClasses = {
  available: 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100',
  on_trip: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  unavailable: 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100',
}

// منطق جلب البيانات والترقيم (يبقى كما هو)
const handlePageChange = (page) => {
  driverStore.fetchDrivers(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات السائقين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// منطق الحفظ (يبقى كما هو)
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

    await driverStore.fetchDrivers(pagination.value.current_page || 1)
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

// منطق الحذف (يبقى كما هو)
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
      await driverStore.fetchDrivers(pagination.value.current_page || 1)
      toast.success(`تم حذف السائق '${driverToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      driverToDelete.value = null
    }
  }
}

// --- بداية الإضافة: منطق عرض الصورة ---
const isImagePreviewOpen = ref(false)
const imageUrlToPreview = ref('')

const openImagePreview = (url) => {
  imageUrlToPreview.value = url
  isImagePreviewOpen.value = true
}
// --- نهاية الإضافة ---
</script>
