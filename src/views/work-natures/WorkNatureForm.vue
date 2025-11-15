<!-- src/views/work-natures/WorkNatureForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="work-nature-name"
        label="اسم طبيعة العمل"
        v-model="form.name"
        placeholder="مثال: نقل داخلي، نقل دولي"
        required
      />
      <AppTextarea
        id="work-nature-description"
        label="الوصف (اختياري)"
        v-model="form.description"
        placeholder="ادخل وصفًا موجزًا"
        rows="3"
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
import AppTextarea from '@/components/ui/AppTextarea.vue' // نفترض وجود هذا المكون
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

const createDefaultForm = () => ({
  id: null,
  name: '',
  description: '',
})

const form = ref(createDefaultForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...newData }
    } else {
      form.value = createDefaultForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
