<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
    @click.self="close"
  >
    <!-- --- بداية التعديل --- -->
    <div
      class="bg-surface-section rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-95 flex flex-col max-h-[90vh]"
      :class="{ 'scale-100': isOpen }"
    >
      <!-- 1. الرأس (Header) -->
      <div
        class="flex-shrink-0 flex justify-between items-center border-b border-surface-border p-4"
      >
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <!-- 2. الجسم (Body) - سيحتوي على النموذج القابل للتمرير -->
      <div class="flex-grow overflow-y-auto">
        <DriverForm
          :initial-data="driverData"
          :is-saving="isSaving"
          @submit="handleFormSubmit"
          class="p-4"
        />
      </div>
    </div>
    <!-- --- نهاية التعديل --- -->
  </div>
</template>

<script setup>
// ... (السكربت يبقى كما هو بدون تغيير)
import { ref, computed, watch } from 'vue'
import DriverForm from './DriverForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  driver: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const driverData = ref(props.driver)

const title = computed(() => (props.driver && props.driver.id ? 'تعديل سائق' : 'إضافة سائق جديد'))

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(
  () => props.driver,
  (val) => {
    driverData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}
const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
