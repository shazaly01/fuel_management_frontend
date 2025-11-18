<!-- src/views/trucks/TrucksList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة الشاحنات</h1>
      <AppButton @click="openTruckModal()"> إضافة شاحنة </AppButton>
    </div>

    <!-- [تمت الإضافة هنا] مكون الفلاتر -->
    <TrucksFilter @filters-applied="handleFiltersApplied" />

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
          <!-- اقرأ الاسم مباشرة من الكائن المضمن -->
          <span v-if="item.driver">
            {{ item.driver.name }}
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
import { useDriverStore } from '@/stores/driverStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import TruckModal from './TruckModal.vue'
import TrucksFilter from './TrucksFilter.vue'

// إعدادات المخازن
const truckStore = useTruckStore()
const { trucks, loading, pagination, activeFilters } = storeToRefs(truckStore)
const driverStore = useDriverStore()
const { drivers } = storeToRefs(driverStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'truck_number', label: 'رقم الشاحنة' },
  // [تمت الإضافة هنا]
  { key: 'trailer_number', label: 'رقم المقطورة' },
  { key: 'color', label: 'اللون' },
  { key: 'truck_type', label: 'النوع' },
  { key: 'driver', label: 'السائق' },
  {
    key: 'actions',
    label: 'إجراءات',
    // class لرأس العمود (th)
    class: 'text-right',
    // cellClass لخلايا المحتوى (td)
    cellClass: 'text-right',
  },
]

// --- [تصحيح نهائي] مطابق للكود العامل ---

// استخراج الفلاتر بدون الصفحة
const currentFilters = computed(() => {
  const { page, ...filters } = activeFilters.value
  return filters
})

// التعامل مع تغيير الصفحة
const handlePageChange = (page) => {
  truckStore.fetchTrucks({ ...currentFilters.value, page }).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الشاحنات.')
  })
}

// التعامل مع تطبيق فلاتر جديدة
const handleFiltersApplied = (filters) => {
  truckStore.fetchTrucks({ ...filters, page: 1 }).catch(() => {
    toast.error('حدث خطأ أثناء تطبيق الفلاتر.')
  })
}

// جلب البيانات الأولية عند تحميل المكون
onMounted(() => {
  truckStore.fetchTrucks({ page: 1 })
})

// --- المنطق المتعلق بعمليات (CRUD) ---

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
    await truckStore.fetchTrucks(activeFilters.value)
    isModalOpen.value = false
  } catch (error) {
    // --- [بداية التعديل هنا] ---
    // تحقق مما إذا كان الخطأ يحتوي على استجابة من الخادم
    if (error.response && error.response.data) {
      const responseData = error.response.data

      // 1. تحقق من وجود كائن "errors" (الأكثر تحديدًا)
      if (responseData.errors) {
        // اعرض كل رسالة خطأ في حقل على حدة
        Object.values(responseData.errors).forEach((errorArray) => {
          errorArray.forEach((errorMessage) => {
            toast.error(errorMessage)
          })
        })
      }
      // 2. إذا لم يكن هناك كائن "errors"، تحقق من وجود "message"
      else if (responseData.message) {
        toast.error(responseData.message)
      }
      // 3. إذا لم يكن أي منهما موجودًا، اعرض رسالة عامة
      else {
        toast.error('حدث خطأ غير متوقع أثناء حفظ البيانات.')
      }
    } else {
      // إذا كان الخطأ لا يتعلق باستجابة الخادم (مثل مشكلة في الشبكة)
      toast.error('حدث خطأ في الشبكة أو تعذر الوصول إلى الخادم.')
      console.error('Save truck error:', error)
    }
    // --- [نهاية التعديل هنا] ---
  } finally {
    isSaving.value = false
  }
}

const deleteSelectedTruck = async () => {
  if (truckToDelete.value) {
    try {
      await truckStore.deleteTruck(truckToDelete.value.id)
      await truckStore.fetchTrucks(activeFilters.value)
      toast.success(`تم حذف الشاحنة '${truckToDelete.value.truck_number}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      truckToDelete.value = null
      isDeleteDialogOpen.value = false
    }
  }
}

// --- حالة الواجهة (Modals) ---
const isModalOpen = ref(false)
const selectedTruck = ref(null)
const isSaving = ref(false)

const openTruckModal = (truck = null) => {
  selectedTruck.value = truck ? { ...truck } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const truckToDelete = ref(null)

const openDeleteDialog = (truck) => {
  truckToDelete.value = truck
  isDeleteDialogOpen.value = true
}
</script>
