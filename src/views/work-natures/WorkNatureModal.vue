<!-- src/views/work-natures/WorkNatureModal.vue -->
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
        <button @click="close" class="text-text-muted hover:text-text-primary">&times;</button>
      </div>

      <WorkNatureForm
        :initial-data="workNatureData"
        :is-saving="isSaving"
        @submit="handleFormSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WorkNatureForm from './WorkNatureForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workNature: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const workNatureData = ref(props.workNature)

const title = computed(() =>
  props.workNature && props.workNature.id ? 'تعديل طبيعة العمل' : 'إضافة طبيعة عمل جديدة',
)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(
  () => props.workNature,
  (val) => {
    workNatureData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}
const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
