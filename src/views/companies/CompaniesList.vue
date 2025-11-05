<!-- src/views/companies/CompaniesList.vue (النسخة المحدثة) -->
<template>
  <div>
    <!-- رأس الصفحة (لا تغيير) -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة الشركات</h1>
      <AppButton @click="openCompanyModal()"> إضافة شركة </AppButton>
    </div>

    <!-- جدول عرض الشركات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="companies || []"
        :is-loading="loading"
        @row-click="openCompanyModal"
      >
        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-4 space-x-reverse">
            <!-- [تم التعديل هنا] -->
            <button
              @click.stop="openEditModal(item)"
              class="font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              تعديل
            </button>
            <!-- [تم التعديل هنا] -->
            <button
              @click.stop="openDeleteDialog(item)"
              class="font-medium text-rose-400 hover:text-rose-300 transition-colors"
            >
              حذف
            </button>
          </div>
        </template>
      </AppTable>

      <!-- [جديد] إضافة مكون الترقيم -->
      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- باقي القالب يبقى كما هو -->
    <CompanyModal
      v-model="isModalOpen"
      :company="selectedCompany"
      :is-saving="isSaving"
      @save="handleSaveCompany"
    />
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الشركة"
      :message="`هل أنت متأكد من رغبتك في حذف شركة '${companyToDelete?.name}'؟`"
      @confirmed="deleteSelectedCompany"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/companyStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CompanyModal from './CompanyModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue' // <-- [جديد] استيراد مكون الترقيم

// إعدادات
const companyStore = useCompanyStore()
// [تم التعديل] جلب pagination من الـ store
const { companies, loading, pagination } = storeToRefs(companyStore)
const toast = useToast()

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم الشركة' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// [جديد] دالة لمعالجة تغيير الصفحة
const handlePageChange = (page) => {
  companyStore.fetchCompanies(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الصفحة الجديدة.')
  })
}

onMounted(() => {
  handlePageChange(1) // جلب الصفحة الأولى عند تحميل المكون
})

// باقي السكربت يبقى كما هو
const handleSaveCompany = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await companyStore.updateCompany(formData.id, formData)
      toast.success(`تم تعديل شركة '${formData.name}' بنجاح.`)
    } else {
      await companyStore.createCompany(formData)
      toast.success(`تمت إضافة شركة '${formData.name}' بنجاح.`)
    }
    // [تم التعديل] جلب الصفحة الحالية لتحديث البيانات
    await companyStore.fetchCompanies(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

const deleteSelectedCompany = async () => {
  if (companyToDelete.value) {
    try {
      await companyStore.deleteCompany(companyToDelete.value.id)
      // [تم التعديل] جلب الصفحة الحالية لتحديث البيانات
      await companyStore.fetchCompanies(pagination.value.current_page)
      toast.success(`تم حذف شركة '${companyToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      companyToDelete.value = null
    }
  }
}

const isModalOpen = ref(false)
const selectedCompany = ref(null)
const isSaving = ref(false)

const openCompanyModal = (company = null) => {
  selectedCompany.value = company
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const companyToDelete = ref(null)

const openDeleteDialog = (company) => {
  companyToDelete.value = company
  isDeleteDialogOpen.value = true
}
</script>
