<template>
  <!-- القالب يبقى كما هو بدون أي تغيير -->
  <div class="p-8 font-sans">
    <!-- شريط الإجراءات (يختفي عند الطباعة) -->
    <div class="print-hide mb-8 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">معاينة طباعة التقرير</h1>
      <AppButton @click="triggerPrint" :disabled="loading">
        <PrinterIcon class="w-5 h-5 ml-2" />
        اطبع الآن
      </AppButton>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div v-if="loading" class="text-center p-10">
      <p class="text-gray-600">جاري جلب بيانات التقرير...</p>
    </div>
    <div v-else-if="error" class="text-center p-10">
      <p class="text-red-500 font-semibold">{{ error }}</p>
    </div>

    <!-- محتوى التقرير -->
    <div v-else id="report-to-print">
      <!-- رأس التقرير المحسّن -->
      <header class="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Delta Trans</h2>
            <p class="text-base text-gray-300">تقرير طلبات الوقود</p>
          </div>
          <div class="text-left text-sm">
            <p class="font-semibold">تاريخ الطباعة</p>
            <p class="font-mono text-gray-300">{{ new Date().toLocaleString() }}</p>
          </div>
        </div>
      </header>

      <!-- قسم خيارات التقرير (الفلاتر) -->
      <div v-if="hasActiveFilters" class="mt-4 border-t pt-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">خيارات التقرير:</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="(value, key) in displayFilters" :key="key" class="filter-badge">
            <span class="filter-label">{{ filterLabels[key] || key }}:</span>
            <span class="filter-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- جدول البيانات -->
      <table class="w-full text-right border-collapse mt-8">
        <thead class="bg-gray-100 text-sm text-gray-600 uppercase">
          <tr>
            <th
              v-for="header in tableHeaders"
              :key="header.key"
              class="py-3 px-4 font-semibold border-b-2 border-gray-200"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-if="reportData && reportData.length > 0"
            v-for="item in reportData"
            :key="item.id"
            class="text-sm text-gray-800 border-b border-gray-200 hover:bg-gray-50"
          >
            <td class="py-3 px-4">{{ item.id }}</td>
            <td class="py-3 px-4">
              <span v-if="item.status" class="font-semibold">{{ item.status.name }}</span>
            </td>
            <td class="py-3 px-4">{{ item.driver?.name || 'N/A' }}</td>
            <td class="py-3 px-4">{{ item.station?.name || 'N/A' }}</td>
            <td class="py-3 px-4">{{ item.product?.name || 'N/A' }}</td>
            <td class="py-3 px-4 font-mono">{{ item.quantity }}</td>
            <td class="py-3 px-4 font-mono">{{ item.order_date }}</td>
          </tr>
          <tr v-else>
            <td :colspan="tableHeaders.length" class="text-center p-8">
              <p class="text-gray-500">لا توجد بيانات تطابق خيارات التقرير المحددة.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// --- قسم السكريبت يبقى كما هو بدون أي تغيير ---
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import fuelOrderService from '@/services/fuelOrderService'
import companyService from '@/services/companyService'
import regionService from '@/services/regionService'
import stationService from '@/services/stationService'
import driverService from '@/services/driverService'
import productService from '@/services/productService'
import orderStatusService from '@/services/orderStatusService'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const reportData = ref([])
const displayFilters = ref({})

const hasActiveFilters = computed(() => Object.keys(displayFilters.value).length > 0)

onMounted(async () => {
  try {
    const reportResponse = await fuelOrderService.get(route.query)
    reportData.value = reportResponse.data.data

    const filters = route.query
    const labels = {}
    const promises = []
    const keys = []

    if (filters.company_id) {
      promises.push(companyService.find(filters.company_id))
      keys.push('company_id')
    }
    if (filters.region_id) {
      promises.push(regionService.find(filters.region_id))
      keys.push('region_id')
    }
    if (filters.station_id) {
      promises.push(stationService.find(filters.station_id))
      keys.push('station_id')
    }
    if (filters.driver_id) {
      promises.push(driverService.find(filters.driver_id))
      keys.push('driver_id')
    }
    if (filters.product_id) {
      promises.push(productService.find(filters.product_id))
      keys.push('product_id')
    }
    if (filters.order_status_id) {
      promises.push(orderStatusService.find(filters.order_status_id))
      keys.push('order_status_id')
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises)
      results.forEach((res, index) => {
        const key = keys[index]
        labels[key] = res.data.name
      })
    }

    if (filters.start_date) labels.start_date = filters.start_date
    if (filters.end_date) labels.end_date = filters.end_date

    displayFilters.value = labels
  } catch (e) {
    console.error('Failed to fetch printable report data:', e)
    error.value = 'حدث خطأ أثناء جلب بيانات التقرير.'
  } finally {
    loading.value = false
  }
})

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'status', label: 'الحالة' },
  { key: 'driver', label: 'السائق' },
  { key: 'station', label: 'المحطة' },
  { key: 'product', label: 'المنتج' },
  { key: 'quantity', label: 'الكمية' },
  { key: 'order_date', label: 'تاريخ الطلب' },
]

const filterLabels = {
  company_id: 'الشركة',
  region_id: 'المنطقة',
  station_id: 'المحطة',
  driver_id: 'السائق',
  product_id: 'المنتج',
  order_status_id: 'الحالة',
  start_date: 'من تاريخ',
  end_date: 'إلى تاريخ',
}

const triggerPrint = () => window.print()
</script>

<style>
/* أنماط الشارات (تبقى كما هي) */
.filter-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
}
.filter-label {
  color: #4b5563;
  margin-left: 4px;
}
.filter-value {
  color: #111827;
  font-weight: 600;
}

/* === [بداية الحل الدقيق هنا] === */
/* كتلة CSS خاصة بالطباعة */
@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
  }
  #report-to-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  /* هذا هو الجزء الأهم: إجبار المتصفح على طباعة الألوان */
  header.bg-gray-800,
  .filter-badge,
  thead.bg-gray-100 {
    -webkit-print-color-adjust: exact !important; /* For Chrome, Safari */
    print-color-adjust: exact !important; /* For Firefox */
  }

  /* ضمان أن يكون لون النص أبيض في الترويسة الداكنة */
  header.bg-gray-800,
  header.bg-gray-800 * {
    color: white !important;
  }
  header.bg-gray-800 p.text-gray-300,
  header.bg-gray-800 p.text-gray-300 * {
    color: #d1d5db !important; /* gray-300 */
  }
}
/* === [نهاية الحل الدقيق هنا] === */
</style>
