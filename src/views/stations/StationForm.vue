<!-- src/views/stations/StationForm.vue (النسخة المحدثة) -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="station-name"
        label="اسم المحطة"
        v-model="form.name"
        placeholder="ادخل اسم المحطة"
        required
      />

      <CompaniesDropdown
        id="station-company"
        label="الشركة التابعة لها"
        v-model="form.company_id"
        required
      />

      <!-- [جديد] إضافة القائمة المنسدلة للمناطق -->
      <RegionsDropdown id="station-region" label="المنطقة" v-model="form.region_id" required />

      <AppInput
        id="station-number"
        label="رقم المحطة (اختياري)"
        v-model="form.station_number"
        placeholder="ادخل رقم المحطة"
      />

      <AppInput
        id="station-address"
        label="العنوان (اختياري)"
        v-model="form.address"
        placeholder="ادخل عنوان المحطة"
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
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import RegionsDropdown from '@/components/forms/RegionsDropdown.vue' // <-- [جديد] استيراد المكون

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const form = ref({
  id: null,
  name: '',
  company_id: '',
  region_id: '', // <-- [جديد] إضافة الحقل
  station_number: '',
  address: '',
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        company_id: newData.company?.id || '',
        region_id: newData.region?.id || '', // <-- [جديد] تعبئة الحقل عند التعديل
        station_number: newData.station_number || '',
        address: newData.address || '',
      }
    } else {
      form.value = {
        id: null,
        name: '',
        company_id: '',
        region_id: '',
        station_number: '',
        address: '',
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
