<!-- src/views/order-statuses/OrderStatusForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="status-name"
        label="اسم الحالة"
        v-model="form.name"
        placeholder="مثال: قيد التنفيذ، تم التسليم"
        required
      />

      <!-- حقل مخصص لاختيار اللون -->
      <div>
        <label
          for="status-color"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          اللون (اختياري)
        </label>
        <div class="flex items-center space-x-3 space-x-reverse">
          <input
            id="status-color"
            type="color"
            v-model="form.color"
            class="p-1 h-10 w-14 block bg-white dark:bg-surface-ground border border-gray-300 dark:border-surface-border cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            title="اختر لونًا"
          />
          <!-- حقل نصي لعرض قيمة اللون -->
          <AppInput
            id="status-color-text"
            v-model="form.color"
            placeholder="#rrggbb"
            class="flex-grow"
          />
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

// تعريف بنية النموذج بناءً على StoreOrderStatusRequest.php
const form = ref({
  id: null,
  name: '',
  color: '#cccccc', // لون افتراضي
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = { ...newData, color: newData.color || '#cccccc' }
    } else {
      // إعادة تعيين النموذج عند إضافة حالة جديدة
      form.value = { id: null, name: '', color: '#cccccc' }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
