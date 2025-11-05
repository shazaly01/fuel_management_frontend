<!-- src/views/trucks/TruckForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput
        id="truck-number"
        label="رقم الشاحنة"
        v-model="form.truck_number"
        placeholder="ادخل رقم الشاحنة"
        required
        class="md:col-span-2"
      />
      <AppInput
        id="truck-type"
        label="نوع الشاحنة (اختياري)"
        v-model="form.truck_type"
        placeholder="مثال: قلاب، صهريج"
      />
      <AppInput
        id="truck-color"
        label="لون الشاحنة (اختياري)"
        v-model="form.color"
        placeholder="ادخل لون الشاحنة"
      />
      <AppInput
        id="trailer-number"
        label="رقم المقطورة (اختياري)"
        v-model="form.trailer_number"
        placeholder="ادخل رقم المقطورة"
        class="md:col-span-2"
      />

      <!-- [جديد] استخدام المكون المخصص للقائمة المنسدلة للسائقين -->
      <DriversDropdown
        id="truck-driver"
        label="السائق المسؤول (اختياري)"
        v-model="form.driver_id"
        class="md:col-span-2"
      />
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
import DriversDropdown from '@/components/forms/DriversDropdown.vue' // <-- [جديد] استيراد المكون

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

// تعريف بنية النموذج بناءً على StoreTruckRequest.php
const form = ref({
  id: null,
  truck_number: '',
  truck_type: '',
  color: '',
  trailer_number: '',
  driver_id: '',
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...newData }
    } else {
      form.value = {
        id: null,
        truck_number: '',
        truck_type: '',
        color: '',
        trailer_number: '',
        driver_id: '',
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
