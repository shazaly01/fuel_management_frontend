<!-- src/views/drivers/DriversList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
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
        <!-- تخصيص عرض خلية الحالة -->
        <template #cell-status="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="statusClasses[item.status] || 'bg-gray-200 text-gray-800'"
          >
            {{ statusTranslations[item.status] || item.status }}
          </span>
        </template>

        <!-- تخصيص عرض خلية الإجراءات -->
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

    <!-- نافذة الإضافة والتعديل -->
    <DriverModal
      v-model="isModalOpen"
      :driver="selectedDriver"
      :is-saving="isSaving"
      @save="handleSaveDriver"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السائق"
      :message="`هل أنت متأكد من رغبتك في حذف السائق '${driverToDelete?.name}'؟`"
      @confirmed="deleteSelectedDriver"
    />
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

// إعدادات
const driverStore = useDriverStore()
const { drivers, loading, pagination } = storeToRefs(driverStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم السائق' },
  { key: 'license_number', label: 'رقم الرخصة' },
  { key: 'phone_number', label: 'رقم الهاتف' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// لترجمة وتلوين الحالة
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

// منطق جلب البيانات والترقيم
const handlePageChange = (page) => {
  driverStore.fetchDrivers(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات السائقين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// منطق الحفظ
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
    if (formData.id) {
      await driverStore.updateDriver(formData.id, formData)
      toast.success(`تم تعديل بيانات السائق '${formData.name}' بنجاح.`)
    } else {
      await driverStore.createDriver(formData)
      toast.success(`تمت إضافة السائق '${formData.name}' بنجاح.`)
    }
    await driverStore.fetchDrivers(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
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
      await driverStore.fetchDrivers(pagination.value.current_page)
      toast.success(`تم حذف السائق '${driverToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      driverToDelete.value = null
    }
  }
}
</script>
