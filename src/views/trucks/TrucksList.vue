<!-- src/views/trucks/TrucksList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة الشاحنات</h1>
      <AppButton @click="openTruckModal()"> إضافة شاحنة </AppButton>
    </div>

    <!-- جدول عرض الشاحنات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="trucks || []"
        :is-loading="loading"
        @row-click="openTruckModal"
      >
        <!-- تخصيص عرض خلية السائق -->
        <template #cell-driver="{ item }">
          <span v-if="item.driver_id && driversMap[item.driver_id]">
            {{ driversMap[item.driver_id] }}
          </span>
          <span v-else-if="item.driver_id" class="text-text-muted">
            سائق (ID: {{ item.driver_id }})
          </span>
          <span v-else class="text-text-muted"> لا يوجد </span>
        </template>

        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openTruckModal(item)"
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
    <TruckModal
      v-model="isModalOpen"
      :truck="selectedTruck"
      :is-saving="isSaving"
      @save="handleSaveTruck"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الشاحنة"
      :message="`هل أنت متأكد من رغبتك في حذف الشاحنة رقم '${truckToDelete?.truck_number}'؟`"
      @confirmed="deleteSelectedTruck"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTruckStore } from '@/stores/truckStore'
import { useDriverStore } from '@/stores/driverStore' // <-- [جديد]
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import TruckModal from './TruckModal.vue'

// إعدادات
const truckStore = useTruckStore()
const { trucks, loading, pagination } = storeToRefs(truckStore)
const driverStore = useDriverStore() // <-- [جديد]
const { drivers } = storeToRefs(driverStore) // <-- [جديد]
const toast = useToast()

// [جديد] إنشاء خريطة لترجمة ID السائق إلى اسم
const driversMap = computed(() => {
  return drivers.value.reduce((map, driver) => {
    map[driver.id] = driver.name
    return map
  }, {})
})

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'truck_number', label: 'رقم الشاحنة' },
  { key: 'truck_type', label: 'النوع' },
  { key: 'driver', label: 'السائق' }, // <-- عمود لعرض اسم السائق
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// منطق جلب البيانات والترقيم
const handlePageChange = (page) => {
  truckStore.fetchTrucks(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الشاحنات.')
  })
}

onMounted(() => {
  handlePageChange(1)
  // [جديد] جلب قائمة السائقين لترجمة الأسماء
  if (drivers.value.length === 0) {
    driverStore.fetchDrivers()
  }
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedTruck = ref(null)
const isSaving = ref(false)

const openTruckModal = (truck = null) => {
  selectedTruck.value = truck
  isModalOpen.value = true
}

const handleSaveTruck = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await truckStore.updateTruck(formData.id, formData)
      toast.success(`تم تعديل بيانات الشاحنة '${formData.truck_number}' بنجاح.`)
    } else {
      await truckStore.createTruck(formData)
      toast.success(`تمت إضافة الشاحنة '${formData.truck_number}' بنجاح.`)
    }
    await truckStore.fetchTrucks(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const truckToDelete = ref(null)

const openDeleteDialog = (truck) => {
  truckToDelete.value = truck
  isDeleteDialogOpen.value = true
}

const deleteSelectedTruck = async () => {
  if (truckToDelete.value) {
    try {
      await truckStore.deleteTruck(truckToDelete.value.id)
      await truckStore.fetchTrucks(pagination.value.current_page)
      toast.success(`تم حذف الشاحنة '${truckToDelete.value.truck_number}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      truckToDelete.value = null
    }
  }
}
</script>
