<!-- src/views/regions/RegionModal.vue (محدث) -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
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

      <!-- [تم التعديل هنا] -->
      <RegionForm :initial-data="region" :is-saving="isSaving" @submit="handleFormSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RegionForm from './RegionForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  region: { type: Object, default: null },
  isSaving: { type: Boolean, default: false }, // <-- إضافة isSaving
})

const emit = defineEmits(['update:modelValue', 'save']) // <-- إضافة save

const isOpen = ref(props.modelValue)
const title = computed(() =>
  props.region && props.region.id ? 'تعديل منطقة' : 'إضافة منطقة جديدة',
)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}
const handleFormSubmit = (formData) => {
  emit('save', formData)
} // <-- تمرير الحدث للأعلى
</script>
