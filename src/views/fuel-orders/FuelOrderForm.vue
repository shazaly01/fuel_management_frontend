<!-- src/views/fuel-orders/FuelOrderForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- العمود الأول -->
      <div class="space-y-4">
        <div v-if="!lockedDriver">
          <DriversDropdown id="order-driver" label="السائق" v-model="form.driver_id" required />
        </div>
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
            >السائق</label
          >
          <div
            class="mt-1 p-3 rounded-md border-2 transition-colors duration-200 bg-gray-100 border-gray-300 dark:bg-surface-ground dark:border-surface-border cursor-not-allowed"
          >
            <p class="font-semibold text-gray-800 dark:text-text-primary">
              {{ lockedDriver.name }}
            </p>
          </div>
        </div>

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
        <QuantityInput id="order-quantity" label="الكمية" v-model="form.quantity" />

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

        <AppInput
          id="order-notification-number"
          label="رقم الإشعار (اختياري)"
          type="text"
          v-model="form.notification_number"
          placeholder="ادخل رقم الإشعار"
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
import QuantityInput from '@/components/ui/QuantityInput.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  lockedDriver: { type: Object, default: null },
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
        notification_number: newData.notification_number || '',
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
        quantity: 40000,
        order_date: new Date().toISOString().slice(0, 10), // تاريخ اليوم كقيمة افتراضية
        delivery_date: '',
        notes: '',
        notification_number: '',
      }
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.lockedDriver,
  (driver) => {
    if (driver && driver.id) {
      form.value.driver_id = driver.id
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
