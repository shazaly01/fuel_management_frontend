<!-- src/views/regions/RegionForm.vue (النسخة المصححة النهائية) -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="region-name"
        label="اسم المنطقة"
        v-model="form.name"
        placeholder="مثال: المنطقة الشرقية"
        required
      />
      <AppInput
        id="region-description"
        label="الوصف (اختياري)"
        v-model="form.description"
        type="textarea"
        placeholder="أي تفاصيل إضافية عن المنطقة"
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

const form = ref({
  id: null,
  name: '',
  description: '',
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        description: newData.description || '',
      }
    } else {
      form.value = { id: null, name: '', description: '' }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
