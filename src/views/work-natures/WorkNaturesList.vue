<!-- src/views/work-natures/WorkNaturesList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة طبيعة العمل</h1>
      <AppButton @click="openModal()"> إضافة </AppButton>
    </div>

    <!-- جدول عرض البيانات -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="workNatures || []" :is-loading="loading">
        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openModal(item)"
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

      <!-- الترقيم (إذا لزم الأمر في المستقبل) -->
      <!-- <AppPagination :meta="pagination" @page-change="handlePageChange" /> -->
    </AppCard>

    <!-- نافذة الإضافة والتعديل (سيتم إنشاؤها لاحقًا) -->
    <WorkNatureModal
      v-model="isModalOpen"
      :work-nature="selectedItem"
      :is-saving="isSaving"
      @save="handleSave"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف طبيعة العمل"
      :message="`هل أنت متأكد من رغبتك في حذف '${itemToDelete?.name}'؟`"
      @confirmed="deleteSelectedItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWorkNatureStore } from '@/stores/workNatureStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
// import AppPagination from '@/components/ui/AppPagination.vue' // للترقيم المستقبلي
import WorkNatureModal from './WorkNatureModal.vue' // <-- سيتم إنشاؤه

// إعدادات
const store = useWorkNatureStore()
const { workNatures, loading, pagination } = storeToRefs(store)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'الاسم' },
  { key: 'description', label: 'الوصف' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// منطق جلب البيانات
onMounted(() => {
  store.fetchWorkNatures().catch(() => {
    toast.error('حدث خطأ أثناء جلب البيانات.')
  })
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedItem = ref(null)
const isSaving = ref(false)

const openModal = (item = null) => {
  selectedItem.value = item
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await store.updateWorkNature(formData.id, formData)
      toast.success(`تم تعديل '${formData.name}' بنجاح.`)
    } else {
      await store.createWorkNature(formData)
      toast.success(`تمت إضافة '${formData.name}' بنجاح.`)
    }
    await store.fetchWorkNatures() // إعادة جلب البيانات لتحديث القائمة
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const itemToDelete = ref(null)

const openDeleteDialog = (item) => {
  itemToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedItem = async () => {
  if (itemToDelete.value) {
    try {
      await store.deleteWorkNature(itemToDelete.value.id)
      // لا حاجة لإعادة الجلب لأن المتجر يحذف محليًا
      toast.success(`تم حذف '${itemToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      itemToDelete.value = null
    }
  }
}
</script>
