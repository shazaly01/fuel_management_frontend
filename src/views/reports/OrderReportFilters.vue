<!-- src/views/reports/OrderReportFilters.vue -->
<template>
  <AppCard class="mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- الفلاتر الأساسية -->
      <CompaniesDropdown
        id="company-filter"
        label="الشركة"
        v-model="filters.company_id"
        :required="false"
      />
      <RegionsDropdown
        id="region-filter"
        label="المنطقة"
        v-model="filters.region_id"
        :required="false"
      />
      <StationsDropdown
        id="station-filter"
        label="المحطة"
        v-model="filters.station_id"
        :required="false"
      />
      <DriversDropdown
        id="driver-filter"
        label="السائق"
        v-model="filters.driver_id"
        :required="false"
      />
      <ProductsDropdown
        id="product-filter"
        label="المنتج"
        v-model="filters.product_id"
        :required="false"
      />
      <OrderStatusesDropdown
        id="status-filter"
        label="الحالة"
        v-model="filters.order_status_id"
        :required="false"
      />

      <!-- قسم فلترة التاريخ المرن -->
      <div
        class="col-span-full lg:col-span-2 border-t-2 border-surface-border pt-4 mt-4 lg:border-t-0 lg:border-r-2 lg:border-surface-border lg:pr-4 lg:mt-0"
      >
        <div class="flex items-center space-x-4 space-x-reverse mb-4">
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="dateFilterMode" value="period" class="form-radio" />
            <span class="mr-2">فترة سريعة</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="radio" v-model="dateFilterMode" value="range" class="form-radio" />
            <span class="mr-2">نطاق مخصص</span>
          </label>
        </div>

        <div v-if="dateFilterMode === 'period'" class="flex items-center space-x-2 space-x-reverse">
          <label for="days-period">آخر</label>
          <AppInput
            id="days-period"
            type="number"
            v-model.number="daysPeriod"
            class="w-24 text-center"
            placeholder="أيام"
          />
          <label>أيام</label>
        </div>

        <div v-if="dateFilterMode === 'range'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput id="start-date" label="من تاريخ" type="date" v-model="customStartDate" />
          <AppInput id="end-date" label="إلى تاريخ" type="date" v-model="customEndDate" />
        </div>
      </div>
    </div>

    <!-- أزرار التحكم -->
    <div
      class="flex justify-end space-x-2 space-x-reverse mt-6 border-t border-surface-border pt-4"
    >
      <AppButton @click="applyFilters">تطبيق الفلاتر</AppButton>
      <AppButton variant="outline" @click="resetFilters">إعادة تعيين</AppButton>
    </div>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'

// استيراد مكونات الواجهة والمكونات المخصصة
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import RegionsDropdown from '@/components/forms/RegionsDropdown.vue'
import StationsDropdown from '@/components/forms/StationsDropdown.vue'
import DriversDropdown from '@/components/forms/DriversDropdown.vue'
import ProductsDropdown from '@/components/forms/ProductsDropdown.vue'
import OrderStatusesDropdown from '@/components/forms/OrderStatusesDropdown.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useRegionStore } from '@/stores/regionStore'

// تعريف الأحداث التي سيطلقها المكون
const emit = defineEmits(['apply-filters', 'reset-filters'])
const companyStore = useCompanyStore()
const regionStore = useRegionStore()
// الحالة الداخلية للفلاتر
const filters = ref({
  company_id: '',
  region_id: '',
  station_id: '',
  driver_id: '',
  product_id: '',
  order_status_id: '',
})

// الحالة الداخلية لفلتر التاريخ
const dateFilterMode = ref('period')
const daysPeriod = ref(7)
const customStartDate = ref('')
const customEndDate = ref('')

defineExpose({
  getDropdownsData: () => ({
    company_id: companyStore.companies,
    region_id: regionStore.regions,
    // ... أضف باقي القوائم هنا
  }),
})

// دالة لتنسيق التاريخ إلى YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const applyFilters = () => {
  let finalFilters = { ...filters.value }

  // حساب فلاتر التاريخ بناءً على الوضع المحدد
  if (dateFilterMode.value === 'period' && daysPeriod.value > 0) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - (daysPeriod.value - 1))
    finalFilters.start_date = formatDate(startDate)
    finalFilters.end_date = formatDate(endDate)
  } else if (dateFilterMode.value === 'range') {
    finalFilters.start_date = customStartDate.value || null
    finalFilters.end_date = customEndDate.value || null
  }

  emit('apply-filters', finalFilters)
}

const resetFilters = () => {
  filters.value = {
    company_id: '',
    region_id: '',
    station_id: '',
    driver_id: '',
    product_id: '',
    order_status_id: '',
  }
  daysPeriod.value = 7
  customStartDate.value = ''
  customEndDate.value = ''
  dateFilterMode.value = 'period'

  emit('reset-filters')
}
</script>
