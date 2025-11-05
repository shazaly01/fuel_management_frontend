<!-- src/views/products/ProductsList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المنتجات</h1>
      <AppButton @click="openProductModal()"> إضافة منتج </AppButton>
    </div>

    <!-- جدول عرض المنتجات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="products || []"
        :is-loading="loading"
        @row-click="openProductModal"
      >
        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openProductModal(item)"
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
    <ProductModal
      v-model="isModalOpen"
      :product="selectedProduct"
      :is-saving="isSaving"
      @save="handleSaveProduct"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المنتج"
      :message="`هل أنت متأكد من رغبتك في حذف منتج '${productToDelete?.name}'؟`"
      @confirmed="deleteSelectedProduct"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ProductModal from './ProductModal.vue'

// إعدادات
const productStore = useProductStore()
const { products, loading, pagination } = storeToRefs(productStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم المنتج' },
  { key: 'description', label: 'الوصف' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// منطق جلب البيانات والترقيم
const handlePageChange = (page) => {
  productStore.fetchProducts(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المنتجات.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedProduct = ref(null)
const isSaving = ref(false)

const openProductModal = (product = null) => {
  selectedProduct.value = product
  isModalOpen.value = true
}

const handleSaveProduct = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await productStore.updateProduct(formData.id, formData)
      toast.success(`تم تعديل منتج '${formData.name}' بنجاح.`)
    } else {
      await productStore.createProduct(formData)
      toast.success(`تمت إضافة منتج '${formData.name}' بنجاح.`)
    }
    await productStore.fetchProducts(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const productToDelete = ref(null)

const openDeleteDialog = (product) => {
  productToDelete.value = product
  isDeleteDialogOpen.value = true
}

const deleteSelectedProduct = async () => {
  if (productToDelete.value) {
    try {
      await productStore.deleteProduct(productToDelete.value.id)
      await productStore.fetchProducts(pagination.value.current_page)
      toast.success(`تم حذف منتج '${productToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      productToDelete.value = null
    }
  }
}
</script>
