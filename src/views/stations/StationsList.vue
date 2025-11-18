<!-- src/views/stations/StationsList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المحطات</h1>
      <AppButton @click="openStationModal()"> إضافة محطة </AppButton>
    </div>

    <!-- مكون الفلاتر الجديد -->
    <StationsFilter @filters-applied="handleFiltersApplied" />

    <!-- جدول عرض المحطات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="stations || []"
        :is-loading="loading"
        @row-click="openStationModal"
      >
        <!-- تخصيص عرض خلية المنطقة -->
        <template #cell-region="{ item }">
          <span v-if="item.region">{{ item.region.name }}</span>
          <span v-else class="text-text-muted">غير محدد</span>
        </template>

        <!-- تخصيص عرض خلية الشركة -->
        <template #cell-company="{ item }">
          <span v-if="item.company">{{ item.company.name }}</span>
          <span v-else class="text-text-muted">غير محدد</span>
        </template>

        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
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

      <!-- مكون تقسيم الصفحات -->
      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- نافذة الإضافة والتعديل -->
    <StationModal
      v-model="isModalOpen"
      :station="selectedStation"
      :is-saving="isSaving"
      @save="handleSaveStation"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المحطة"
      :message="`هل أنت متأكد من رغبتك في حذف محطة '${stationToDelete?.name}'؟`"
      @confirmed="deleteSelectedStation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
import StationsFilter from './StationsFilter.vue'

const stationStore = useStationStore()
const { stations, loading, pagination, activeFilters } = storeToRefs(stationStore)
const toast = useToast()

const tableHeaders = [
  { key: 'name', label: 'اسم المحطة' },
  { key: 'region', label: 'المنطقة' },
  { key: 'address', label: 'العنوان' },
  { key: 'company', label: 'الشركة' },
  { key: 'actions', label: 'إجراءات', class: 'text-right' },
]

// استخراج الفلاتر بدون الصفحة (للاستخدام عند تغيير الصفحة)
const currentFilters = computed(() => {
  const { page, ...filters } = activeFilters.value
  return filters
})

// التعامل مع تغيير الصفحة
const handlePageChange = (page) => {
  stationStore.fetchStations({ ...currentFilters.value, page }).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الصفحة الجديدة.')
  })
}

// التعامل مع تطبيق فلاتر جديدة
const handleFiltersApplied = (filters) => {
  stationStore.fetchStations({ ...filters, page: 1 }).catch(() => {
    toast.error('حدث خطأ أثناء تطبيق الفلاتر.')
  })
}

// جلب البيانات الأولية عند تحميل المكون
onMounted(() => {
  stationStore.fetchStations({ page: 1 })
})

// التعامل مع الحفظ (إضافة أو تعديل)
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
    await stationStore.fetchStations(activeFilters.value)
    isModalOpen.value = false
  } catch (error) {
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

// التعامل مع الحذف
const deleteSelectedStation = async () => {
  if (stationToDelete.value) {
    try {
      await stationStore.deleteStation(stationToDelete.value.id)
      await stationStore.fetchStations(activeFilters.value)
      toast.success(`تم حذف محطة '${stationToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      stationToDelete.value = null
      isDeleteDialogOpen.value = false
    }
  }
}

// --- حالة الواجهة (Modals) ---
const isModalOpen = ref(false)
const selectedStation = ref(null)
const isSaving = ref(false)
const openStationModal = (station = null) => {
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
