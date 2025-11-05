<!-- src/views/drivers/DriverForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="driver-name"
        label="اسم السائق"
        v-model="form.name"
        placeholder="ادخل اسم السائق"
        required
      />
      <AppInput
        id="driver-license"
        label="رقم الرخصة"
        v-model="form.license_number"
        placeholder="ادخل رقم الرخصة"
        required
      />
      <AppInput
        id="driver-phone"
        label="رقم الهاتف (اختياري)"
        v-model="form.phone_number"
        placeholder="ادخل رقم الهاتف"
      />

      <!-- قائمة منسدلة لحالة السائق -->
      <div>
        <label
          for="driver-status"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          الحالة
        </label>
        <select
          id="driver-status"
          v-model="form.status"
          class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary"
        >
          <option value="available">متاح</option>
          <option value="on_trip">في رحلة</option>
          <option value="unavailable">غير متاح</option>
        </select>
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

// تعريف بنية النموذج بناءً على StoreDriverRequest.php
const form = ref({
  id: null,
  name: '',
  license_number: '',
  phone_number: '',
  status: 'available', // قيمة افتراضية
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...newData }
    } else {
      form.value = { id: null, name: '', license_number: '', phone_number: '', status: 'available' }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
