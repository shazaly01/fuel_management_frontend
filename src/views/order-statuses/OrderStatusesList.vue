<!-- src/views/order-statuses/OrderStatusesList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة حالات الطلب</h1>
      <AppButton @click="openStatusModal()"> إضافة حالة </AppButton>
    </div>

    <!-- جدول عرض الحالات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="orderStatuses || []"
        :is-loading="loading"
        @row-click="openStatusModal"
      >
        <!-- تخصيص عرض خلية اللون -->
        <template #cell-color="{ item }">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span
              class="w-6 h-6 rounded-full border border-gray-400 dark:border-gray-600"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span>{{ item.color }}</span>
          </div>
        </template>

        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openStatusModal(item)"
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
      <!-- لا يوجد ترقيم صفحات هنا -->
    </AppCard>

    <!-- نافذة الإضافة والتعديل -->
    <OrderStatusModal
      v-model="isModalOpen"
      :status="selectedStatus"
      :is-saving="isSaving"
      @save="handleSaveStatus"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الحالة"
      :message="`هل أنت متأكد من رغبتك في حذف حالة '${statusToDelete?.name}'؟`"
      @confirmed="deleteSelectedStatus"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStatusStore } from '@/stores/orderStatusStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import OrderStatusModal from './OrderStatusModal.vue'

// إعدادات
const orderStatusStore = useOrderStatusStore()
const { orderStatuses, loading } = storeToRefs(orderStatusStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم الحالة' },
  { key: 'color', label: 'اللون' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// جلب البيانات عند تحميل المكون
onMounted(() => {
  orderStatusStore.fetchOrderStatuses().catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الحالات.')
  })
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedStatus = ref(null)
const isSaving = ref(false)

const openStatusModal = (status = null) => {
  selectedStatus.value = status
  isModalOpen.value = true
}

const handleSaveStatus = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await orderStatusStore.updateOrderStatus(formData.id, formData)
      toast.success(`تم تعديل حالة '${formData.name}' بنجاح.`)
    } else {
      await orderStatusStore.createOrderStatus(formData)
      toast.success(`تمت إضافة حالة '${formData.name}' بنجاح.`)
    }
    await orderStatusStore.fetchOrderStatuses() // تحديث القائمة
    isModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const statusToDelete = ref(null)

const openDeleteDialog = (status) => {
  statusToDelete.value = status
  isDeleteDialogOpen.value = true
}

const deleteSelectedStatus = async () => {
  if (statusToDelete.value) {
    try {
      await orderStatusStore.deleteOrderStatus(statusToDelete.value.id)
      await orderStatusStore.fetchOrderStatuses() // تحديث القائمة
      toast.success(`تم حذف حالة '${statusToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      statusToDelete.value = null
    }
  }
}
</script>
