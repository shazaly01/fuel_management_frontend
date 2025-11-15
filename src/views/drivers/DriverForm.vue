<template>
  <!-- --- بداية التعديل: إزالة div الأب --- -->
  <form @submit.prevent="handleSubmit">
    <!-- 1. المحتوى القابل للتمرير -->
    <div class="space-y-4">
      <AppInput id="driver-name" label="اسم السائق" v-model="form.name" required />
      <AppInput id="driver-license" label="رقم الرخصة" v-model="form.license_number" required />
      <AppInput id="driver-phone" label="رقم الهاتف (اختياري)" v-model="form.phone_number" />
      <AppInput id="driver-address" label="العنوان (اختياري)" v-model="form.address" />
      <WorkNaturesDropdown id="driver-work-nature" v-model="form.work_nature_id" />

      <div>
        <label
          for="driver-status"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
          >الحالة</label
        >
        <select
          id="driver-status"
          v-model="form.status"
          class="block w-full rounded-md shadow-sm ..."
        >
          <option value="available">متاح</option>
          <option value="on_trip">في رحلة</option>
          <option value="unavailable">غير متاح</option>
        </select>
      </div>

      <AppImageUpload id="document-image" label="صورة بطاقة السائق" v-model="form.document_image" />
    </div>

    <!-- 2. التذييل الثابت (الأزرار) -->
    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
  <!-- --- نهاية التعديل --- -->
</template>

<script setup>
// ... (السكربت يبقى كما هو بدون تغيير)
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import WorkNaturesDropdown from '@/components/forms/WorkNaturesDropdown.vue'
import AppImageUpload from '@/components/ui/AppImageUpload.vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const createDefaultForm = () => ({
  id: null,
  name: '',
  license_number: '',
  phone_number: '',
  status: 'available',
  address: '',
  work_nature_id: null,
  document_image: null,
})

const form = ref(createDefaultForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...createDefaultForm(), ...newData }
      form.value.work_nature_id = newData.work_nature ? newData.work_nature.id : null
      form.value.document_image = newData.document_image_url
    } else {
      form.value = createDefaultForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  const formData = new FormData()

  for (const key in form.value) {
    if (key === 'document_image') continue

    const value = form.value[key]
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  }

  if (form.value.document_image instanceof File) {
    formData.append('document_image', form.value.document_image)
  }

  if (form.value.id) {
    formData.append('_method', 'PUT')
  }

  emit('submit', formData)
}
</script>
