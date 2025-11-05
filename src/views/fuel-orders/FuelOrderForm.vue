<!-- src/views/fuel-orders/FuelOrderForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- العمود الأول -->
      <div class="space-y-4">
        <DriversDropdown id="order-driver" label="السائق" v-model="form.driver_id" required />

        <StationsDropdown id="order-station" label="المحطة" v-model="form.station_id" required />

        <ProductsDropdown id="order-product" label="المنتج" v-model="form.product_id" required />

        <OrderStatusesDropdown
          id="order-status"
          label="حالة الطلب"
          v-model="form.order_status_id"
          required
        />
      </div>

      <!-- العمود الثاني -->
      <div class="space-y-4">
        <AppInput
          id="order-quantity"
          label="الكمية"
          type="number"
          step="0.01"
          v-model="form.quantity"
          placeholder="ادخل الكمية"
        />

        <AppInput
          id="order-date"
          label="تاريخ الطلب"
          type="date"
          v-model="form.order_date"
          required
        />

        <AppInput
          id="order-delivery-date"
          label="تاريخ التسليم (اختياري)"
          type="datetime-local"
          v-model="form.delivery_date"
        />

        <div>
          <label
            for="order-notes"
            class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
          >
            ملاحظات (اختياري)
          </label>
          <textarea
            id="order-notes"
            v-model="form.notes"
            rows="4"
            placeholder="ادخل أي ملاحظات إضافية"
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-primary dark:focus:border-primary"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

// استيراد جميع القوائم المنسدلة
import DriversDropdown from '@/components/forms/DriversDropdown.vue'
import StationsDropdown from '@/components/forms/StationsDropdown.vue'
import ProductsDropdown from '@/components/forms/ProductsDropdown.vue'
import OrderStatusesDropdown from '@/components/forms/OrderStatusesDropdown.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// تعريف بنية النموذج بناءً على StoreFuelOrderRequest.php
const form = ref({
  id: null,
  driver_id: '',
  station_id: '',
  product_id: '',
  order_status_id: '',
  quantity: null,
  order_date: '',
  delivery_date: '',
  notes: '',
})

// دالة لتحويل التاريخ من وإلى التنسيق المناسب لحقل datetime-local
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  // التحقق من صحة التاريخ قبل تحويله
  if (isNaN(date.getTime())) return ''
  // إزالة الثواني والمعلومات الزمنية
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date.toISOString().slice(0, 16)
}

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        ...newData,
        // تأكد من أن القيم null لا تظهر كـ "null" في الحقول
        quantity: newData.quantity || null,
        notes: newData.notes || '',
        // تحويل تنسيق تاريخ التسليم ليتوافق مع حقل الإدخال
        delivery_date: formatDateTimeForInput(newData.delivery_date),
        // تأكد من أن الـ IDs موجودة
        driver_id: newData.driver?.id || '',
        station_id: newData.station?.id || '',
        product_id: newData.product?.id || '',
        order_status_id: newData.status?.id || '',
      }
    } else {
      // إعادة تعيين النموذج عند إضافة طلب جديد
      form.value = {
        id: null,
        driver_id: '',
        station_id: '',
        product_id: '',
        order_status_id: '',
        quantity: null,
        order_date: new Date().toISOString().slice(0, 10), // تاريخ اليوم كقيمة افتراضية
        delivery_date: '',
        notes: '',
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
