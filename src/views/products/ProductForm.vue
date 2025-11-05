<!-- src/views/products/ProductForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="product-name"
        label="اسم المنتج"
        v-model="form.name"
        placeholder="ادخل اسم المنتج"
        required
      />

      <!-- استخدام textarea للوصف لأنه قد يكون طويلاً -->
      <div>
        <label
          for="product-description"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          الوصف (اختياري)
        </label>
        <textarea
          id="product-description"
          v-model="form.description"
          rows="4"
          placeholder="ادخل وصفًا للمنتج"
          class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:ring-primary dark:focus:border-primary"
        ></textarea>
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

// تعريف بنية النموذج بناءً على StoreProductRequest.php
const form = ref({
  id: null,
  name: '',
  description: '',
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...newData }
    } else {
      // إعادة تعيين النموذج عند إضافة منتج جديد
      form.value = { id: null, name: '', description: '' }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
