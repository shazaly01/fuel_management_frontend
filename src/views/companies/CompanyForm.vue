<!-- src/views/companies/CompanyForm.vue (النسخة المصححة) -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="company-name"
        label="اسم الشركة"
        v-model="form.name"
        placeholder="ادخل اسم الشركة"
        required
      />
      <!-- تم حذف حقلي contact_person و contact_phone -->
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

// [تم التعديل] تم تبسيط النموذج ليحتوي على الحقول الصحيحة فقط
const form = ref({
  id: null,
  name: '',
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { id: newData.id, name: newData.name }
    } else {
      // إعادة تعيين النموذج
      form.value = { id: null, name: '' }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
