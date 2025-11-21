<template>
  <!-- [تعديل] تم تغيير الشبكة إلى 4 أعمدة -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <!-- حقل البحث -->
    <div>
      <AppInput
        id="search-driver"
        label="البحث"
        v-model="filters.search"
        placeholder="ابحث بالاسم أو الهاتف..."
        @input="emitFilters"
      />
    </div>

    <!-- [إضافة] حقل رقم الرخصة -->
    <div>
      <AppInput
        id="license-number-filter"
        label="رقم الرخصة"
        v-model="filters.license_number"
        placeholder="ابحث برقم الرخصة..."
        @input="emitFilters"
      />
    </div>

    <!-- فلتر الحالة -->
    <div>
      <AppDropdown
        id="status-filter"
        label="الحالة"
        v-model="filters.status"
        :options="statusOptions"
        placeholder="اختر الحالة"
        @update:model-value="emitFilters"
        option-label="label"
        option-value="value"
      />
    </div>

    <!-- فلتر طبيعة العمل -->
    <div>
      <AppDropdown
        id="work-nature-filter"
        label="طبيعة العمل"
        v-model="filters.work_nature_id"
        :options="workNatureOptions"
        :loading="isLoadingWorkNatures"
        placeholder="اختر طبيعة العمل"
        @update:model-value="emitFilters"
        option-label="label"
        option-value="value"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useWorkNatureStore } from '@/stores/workNatureStore'
import { storeToRefs } from 'pinia'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const emit = defineEmits(['filters-changed'])

const filters = ref({
  search: '',
  status: '',
  work_nature_id: '',
  // [إضافة] إضافة الخاصية الجديدة هنا
  license_number: '',
})

const emitFilters = useDebounceFn(() => {
  // لا حاجة لتعديل هنا، سيتم إرسال الكائن كاملاً
  emit('filters-changed', filters.value)
}, 300)

// --- فلتر الحالة ---
const statusOptions = [
  { value: '', label: 'الكل' },
  { value: 'available', label: 'متاح' },
  { value: 'on_trip', label: 'في رحلة' },
  { value: 'unavailable', label: 'غير متاح' },
  { value: 'wants_to_work', label: 'يريد عمل' },
]

// --- فلتر طبيعة العمل ---
const workNatureStore = useWorkNatureStore()
const { workNatures, loading: isLoadingWorkNatures } = storeToRefs(workNatureStore)

const workNatureOptions = computed(() => {
  const options = workNatures.value.map((wn) => ({
    value: wn.id,
    label: wn.name,
  }))
  return [{ value: '', label: 'الكل' }, ...options]
})

onMounted(() => {
  if (workNatures.value.length === 0) {
    workNatureStore.fetchWorkNatures()
  }
})
</script>
