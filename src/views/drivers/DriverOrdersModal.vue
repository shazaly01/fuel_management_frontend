<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    @click.self="close"
  >
    <!-- استخدام max-w-5xl لجعل النافذة أعرض لتناسب الجدول -->
    <div
      class="bg-surface-section rounded-lg shadow-xl w-full max-w-5xl transform transition-all duration-300 scale-95 flex flex-col"
      style="height: 90vh"
      :class="{ 'scale-100': isOpen }"
    >
      <!-- رأس النافذة -->
      <div
        class="flex-shrink-0 flex justify-between items-center border-b border-surface-border p-4"
      >
        <h3 class="text-lg font-semibold text-text-primary">طلبيات السائق: {{ driver.name }}</h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <!-- جسم النافذة (يحتوي على الجدول) -->
      <div class="flex-grow overflow-y-auto p-4">
        <FuelOrdersTable
          :items="orders"
          :pagination="ordersPagination"
          :is-loading="isLoading"
          :show-driver-column="false"
          @edit-order="openEditOrderModal"
          @delete-order="openDeleteOrderDialog"
          @page-change="fetchDriverOrders"
        />
      </div>

      <!-- النوافذ المنبثقة الفرعية (للتعديل والحذف) -->
      <FuelOrderModal
        v-model="isEditModalOpen"
        :order="selectedOrder"
        :is-saving="isSaving"
        @save="handleSaveOrder"
      />
      <AppConfirmDialog
        v-model="isDeleteDialogOpen"
        title="تأكيد حذف الطلب"
        :message="`هل أنت متأكد من رغبتك في حذف الطلب رقم '${orderToDelete?.id}'؟`"
        @confirmed="deleteSelectedOrder"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFuelOrderStore } from '@/stores/fuelOrderStore'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import FuelOrdersTable from '@/views/fuel-orders/FuelOrdersTable.vue'
import FuelOrderModal from '@/views/fuel-orders/FuelOrderModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  driver: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const fuelOrderStore = useFuelOrderStore()
const toast = useToast()

const isOpen = ref(props.modelValue)
const orders = ref([])
const ordersPagination = ref({})
const isLoading = ref(false)

/**
 * جلب طلبيات السائق المحدد من الـ API.
 */
const fetchDriverOrders = async (page = 1) => {
  if (!props.driver) return
  isLoading.value = true
  try {
    // نستخدم نفس الدالة الموجودة في الـ store ولكن مع فلتر السائق
    const response = await fuelOrderStore.fetchFuelOrders({
      driver_id: props.driver.id,
      page: page,
    })
    // ملاحظة: نفترض أن fetchFuelOrders يرجع البيانات مباشرة أو يمكننا الوصول إليها من الـ store
    orders.value = fuelOrderStore.fuelOrders
    ordersPagination.value = fuelOrderStore.pagination
  } catch (error) {
    toast.error('فشل تحميل طلبيات السائق.')
  } finally {
    isLoading.value = false
  }
}

// مراقبة فتح وإغلاق النافذة
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
    if (val && props.driver) {
      // جلب البيانات عند فتح النافذة
      fetchDriverOrders(1)
    } else {
      // تفريغ البيانات عند إغلاق النافذة
      orders.value = []
      ordersPagination.value = {}
    }
  },
)

const close = () => emit('update:modelValue', false)

// --- منطق التعديل والحذف (منقول ومكيف من FuelOrdersList) ---

// منطق الحفظ (التعديل)
const isEditModalOpen = ref(false)
const selectedOrder = ref(null)
const isSaving = ref(false)

const openEditOrderModal = (order) => {
  selectedOrder.value = order
  isEditModalOpen.value = true
}

const handleSaveOrder = async (formData) => {
  isSaving.value = true
  try {
    // هنا نقوم بالتعديل فقط
    await fuelOrderStore.updateFuelOrder(formData.id, formData)
    toast.success(`تم تعديل الطلب رقم '${formData.id}' بنجاح.`)
    await fetchDriverOrders(ordersPagination.value.current_page || 1) // إعادة تحميل البيانات
    isEditModalOpen.value = false
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const orderToDelete = ref(null)

const openDeleteOrderDialog = (order) => {
  orderToDelete.value = order
  isDeleteDialogOpen.value = true
}

const deleteSelectedOrder = async () => {
  if (orderToDelete.value) {
    try {
      await fuelOrderStore.deleteFuelOrder(orderToDelete.value.id)
      toast.success(`تم حذف الطلب رقم '${orderToDelete.value.id}' بنجاح.`)
      await fetchDriverOrders(ordersPagination.value.current_page || 1) // إعادة تحميل البيانات
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      orderToDelete.value = null
    }
  }
}
</script>
