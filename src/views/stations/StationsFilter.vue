<!-- src/views/stations/StationsFilter.vue -->
<template>
  <AppCard class="mb-6">
    <form @submit.prevent="applyFilters" class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <!-- فلتر اسم المحطة -->
      <AppInput
        id="filter-name"
        v-model="filters.name"
        label="اسم المحطة"
        placeholder="ابحث بالاسم..."
      />

      <!-- فلتر رقم المحطة -->
      <AppInput
        id="filter-station-number"
        v-model="filters.station_number"
        label="رقم المحطة"
        placeholder="ابحث بالرقم..."
      />

      <!-- فلتر الشركة -->
      <CompaniesDropdown id="filter-company" v-model="filters.company_id" />

      <!-- فلتر المنطقة -->
      <RegionsDropdown id="filter-region" v-model="filters.region_id" />

      <!-- أزرار التحكم -->
      <div class="flex items-end space-x-2 space-x-reverse">
        <AppButton type="submit" variant="primary" class="flex-grow">
          <MagnifyingGlassIcon class="w-5 h-5 ml-1" />
          بحث
        </AppButton>
        <AppButton @click="resetFilters" variant="secondary" class="flex-grow">
          <ArrowPathIcon class="w-5 h-5 ml-1" />
          إعادة تعيين
        </AppButton>
      </div>
    </form>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import RegionsDropdown from '@/components/forms/RegionsDropdown.vue'
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

// تعريف الأحداث التي سيصدرها المكون
const emit = defineEmits(['filters-applied'])

// الحالة الداخلية للمكون لتخزين قيم الفلاتر
const filters = ref({
  name: '',
  station_number: '',
  company_id: '',
  region_id: '',
})

// دالة لتطبيق الفلاتر
const applyFilters = () => {
  // إزالة أي خصائص فارغة من كائن الفلاتر قبل إرساله
  const activeFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => value !== '' && value !== null),
  )
  emit('filters-applied', activeFilters)
}

// دالة لإعادة تعيين الفلاتر
const resetFilters = () => {
  filters.value = {
    name: '',
    station_number: '',
    company_id: '',
    region_id: '',
  }
  // تطبيق الفلاتر الفارغة لإعادة تحميل القائمة الأصلية
  applyFilters()
}
</script>
