<!-- src/views/fuel-orders/FuelOrderModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <!-- استخدام max-w-3xl لجعله أعرض قليلاً ليناسب النموذج المقسم لعمودين -->
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-3xl transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <FuelOrderForm
        :initial-data="orderData"
        :is-saving="isSaving"
        :locked-driver="driver"
        @submit="handleFormSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import FuelOrderForm from './FuelOrderForm.vue' // <-- استيراد النموذج

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  order: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  driver: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const orderData = ref(props.order)

const title = computed(() => {
  if (props.driver) {
    return `إضافة طلبية للسائق: ${props.driver.name}`
  }
  return props.order && props.order.id ? 'تعديل طلب وقود' : 'إضافة طلب وقود جديد'
})

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(
  () => props.order,
  (val) => {
    orderData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}
const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
