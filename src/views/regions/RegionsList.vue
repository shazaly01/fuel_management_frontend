<!-- src/views/regions/RegionsList.vue (النسخة المصححة والنهائية) -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المناطق</h1>
      <AppButton @click="openAddModal">
        <PlusIcon class="w-5 h-5 ml-2" />
        إضافة منطقة
      </AppButton>
    </div>

    <!-- جدول عرض المناطق -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="store.regions" :is-loading="loading">
        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-4 space-x-reverse">
            <button
              @click.stop="openEditModal(item)"
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

      <!-- الترقيم -->
      <AppPagination
        v-if="store.pagination"
        :meta="store.pagination"
        @page-change="handlePageChange"
      />
    </AppCard>

    <!-- نافذة الإضافة والتعديل -->
    <RegionModal
      v-model="isModalOpen"
      :region="selectedRegion"
      :is-saving="isSaving"
      @save="handleSaveRegion"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDialogVisible"
      title="تأكيد حذف المنطقة"
      :message="`هل أنت متأكد من رغبتك في حذف المنطقة '${regionToDelete?.name}'؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegionStore } from '@/stores/regionStore'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import RegionModal from './RegionModal.vue'
import { PlusIcon } from '@heroicons/vue/24/solid'

const store = useRegionStore()
const toast = useToast()

const loading = ref(true)
const isSaving = ref(false) // <-- [جديد] حالة للتحكم في زر الحفظ
const isModalOpen = ref(false)
const selectedRegion = ref(null)
const isDialogVisible = ref(false)
const regionToDelete = ref(null)

const tableHeaders = [
  { key: 'name', label: 'الاسم' },
  { key: 'description', label: 'الوصف' },
  { key: 'actions', label: 'إجراءات' },
]

// --- [بداية الكود الجديد والمصحح] ---

// دالة لمعالجة الحفظ (إضافة أو تعديل)
const handleSaveRegion = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      // حالة التعديل
      await store.updateRegion(formData.id, formData)
      toast.success(`تم تعديل المنطقة '${formData.name}' بنجاح.`)
    } else {
      // حالة الإضافة
      await store.addRegion(formData)
      toast.success(`تمت إضافة المنطقة '${formData.name}' بنجاح.`)
    }
    // بعد النجاح، أغلق النافذة وأعد جلب البيانات
    isModalOpen.value = false
    const currentPage = store.pagination?.current_page || 1
    await store.fetchRegions({ page: currentPage })
  } catch (error) {
    // التعامل مع الأخطاء القادمة من الـ Store
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ المنطقة.'
    const errors = error.response?.data?.errors
    if (errors) {
      // عرض أخطاء الـ validation
      Object.values(errors).forEach((err) => toast.error(err[0]))
    } else {
      toast.error(errorMessage)
    }
  } finally {
    isSaving.value = false
  }
}

// --- [نهاية الكود الجديد والمصحح] ---

const handlePageChange = (page) => {
  loading.value = true
  store.fetchRegions({ page }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  handlePageChange(1)
})

const openAddModal = () => {
  selectedRegion.value = null
  isModalOpen.value = true
}

const openEditModal = (region) => {
  selectedRegion.value = { ...region }
  isModalOpen.value = true
}

const openDeleteDialog = (region) => {
  regionToDelete.value = region
  isDialogVisible.value = true
}

const confirmDelete = async () => {
  if (regionToDelete.value) {
    await store.deleteRegion(regionToDelete.value.id)
    // لا حاجة لإعادة الجلب هنا لأن دالة الحذف في الـ store تقوم بذلك
  }
  regionToDelete.value = null
  isDialogVisible.value = false
}
</script>
