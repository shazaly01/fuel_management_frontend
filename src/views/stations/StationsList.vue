<!-- src/views/stations/StationsList.vue (النسخة المصححة حسب طلبك) -->
<template>
  <div>
    <!-- رأس الصفحة (لا تغيير) -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المحطات</h1>
      <AppButton @click="openStationModal()"> إضافة محطة </AppButton>
    </div>

    <!-- جدول عرض المحطات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="stations || []"
        :is-loading="loading"
        @row-click="openStationModal"
      >
        <!-- [تعديل] تخصيص عرض خلية المنطقة -->
        <template #cell-region="{ item }">
          <span v-if="item.region">{{ item.region.name }}</span>
          <span v-else class="text-text-muted">غير محدد</span>
        </template>

        <template #cell-company="{ item }">
          <span v-if="item.company">{{ item.company.name }}</span>
          <span v-else class="text-text-muted">غير محدد</span>
        </template>

        <template #cell-actions="{ item }">
          <!-- [تم التعديل هنا] -->
          <!-- أضفنا 'justify-start' لمحاذاة العناصر إلى بداية الحاوية (اليسار في RTL) -->
          <div class="flex items-center justify-start space-x-4 space-x-reverse">
            <button
              @click.stop="openStationModal(item)"
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

    <!-- باقي القالب يبقى كما هو -->
    <StationModal
      v-model="isModalOpen"
      :station="selectedStation"
      :is-saving="isSaving"
      @save="handleSaveStation"
    />
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المحطة"
      :message="`هل أنت متأكد من رغبتك في حذف محطة '${stationToDelete?.name}'؟`"
      @confirmed="deleteSelectedStation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStationStore } from '@/stores/stationStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import StationModal from './StationModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const stationStore = useStationStore()
const { stations, loading, pagination } = storeToRefs(stationStore)
const toast = useToast()

// --- [تم التعديل هنا حسب طلبك] ---
const tableHeaders = [
  { key: 'name', label: 'اسم المحطة' },
  { key: 'region', label: 'المنطقة' }, // <-- إضافة المنطقة
  { key: 'address', label: 'العنوان' }, // <-- إضافة العنوان
  { key: 'company', label: 'الشركة' },
  { key: 'actions', label: 'إجراءات', class: 'text-right' },
]
// ------------------------------------

const handlePageChange = (page) => {
  stationStore.fetchStations(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الصفحة الجديدة.')
  })
}

onMounted(() => {
  // تأكد من أن دالة fetchStations تقوم بتحميل العلاقات
  // stationStore.fetchStations(1, { with: ['company', 'region'] })
  handlePageChange(1)
})

const handleSaveStation = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await stationStore.updateStation(formData.id, formData)
      toast.success(`تم تعديل محطة '${formData.name}' بنجاح.`)
    } else {
      await stationStore.createStation(formData)
      toast.success(`تمت إضافة محطة '${formData.name}' بنجاح.`)
    }
    await stationStore.fetchStations(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    // تحسين عرض رسائل الخطأ
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    const errors = error.response?.data?.errors
    if (errors) {
      Object.values(errors).forEach((err) => toast.error(err[0]))
    } else {
      toast.error(errorMessage)
    }
  } finally {
    isSaving.value = false
  }
}

const deleteSelectedStation = async () => {
  if (stationToDelete.value) {
    try {
      await stationStore.deleteStation(stationToDelete.value.id)
      await stationStore.fetchStations(pagination.value.current_page)
      toast.success(`تم حذف محطة '${stationToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      stationToDelete.value = null
    }
  }
}

const isModalOpen = ref(false)
const selectedStation = ref(null)
const isSaving = ref(false)

const openStationModal = (station = null) => {
  // التأكد من أننا نمرر نسخة من الكائن لتجنب التعديل المباشر
  selectedStation.value = station ? { ...station } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const stationToDelete = ref(null)

const openDeleteDialog = (station) => {
  stationToDelete.value = station
  isDeleteDialogOpen.value = true
}
</script>
