<template>
  <div class="bg-gray-100 min-h-screen font-sans print:bg-white">
    <!-- شريط الإجراءات (يختفي عند الطباعة) -->
    <div class="max-w-5xl mx-auto p-4 print-hide">
      <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
        <h3 class="font-bold text-gray-700">معاينة طباعة طلب الوقود</h3>
        <AppButton @click="triggerPrint" :disabled="loading" variant="primary">
          <PrinterIcon class="w-5 h-5 ml-2" />
          اطبع الآن
        </AppButton>
      </div>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div
      v-if="loading || error"
      class="text-center p-10 max-w-5xl mx-auto bg-white my-4 rounded-lg shadow"
    >
      <p v-if="loading" class="text-gray-600">جاري تجهيز بيانات الطلب...</p>
      <p v-else class="text-red-500 font-semibold">{{ error }}</p>
    </div>

    <!-- تصميم التقرير -->
    <div
      v-else-if="order"
      id="report-to-print"
      class="max-w-5xl mx-auto my-4 bg-white rounded-lg shadow-lg overflow-hidden relative"
    >
      <!-- 1. رأس التقرير -->
      <header
        class="absolute top-0 left-0 right-0 h-64 overflow-hidden print:relative print:h-auto print:bg-primary"
      >
        <div class="shape-bg absolute w-full h-full bg-primary print:hidden"></div>
        <div class="relative flex justify-between items-start p-8 md:p-10 text-white">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-white/20 flex items-center justify-center rounded-lg backdrop-blur-sm border border-white/20"
            >
              <TruckIcon class="w-8 h-8" />
            </div>
            <div>
              <h2 class="text-3xl font-bold">Delta Trans</h2>
              <p class="text-sm opacity-80">نقل وتوزيع المحروقات</p>
            </div>
          </div>
          <div class="text-right">
            <h1 class="text-4xl font-extrabold uppercase tracking-wider">طلب وقود</h1>
            <p class="font-mono opacity-80 mt-1">#{{ order.id }}</p>
          </div>
        </div>
      </header>

      <!-- المحتوى الرئيسي -->
      <div class="relative mt-48 print:mt-0 p-8 md:p-10">
        <!-- 2. بطاقات معلومات الطلب -->
        <section
          class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-white/60 backdrop-blur-md border border-gray-200/80 p-6 rounded-lg shadow-md print:bg-transparent print:shadow-none print:border-none print:p-0"
        >
          <!-- معلومات السائق -->
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase mb-2">بيانات السائق:</p>
            <p class="text-lg font-bold text-gray-800">{{ order.driver?.name || 'غير محدد' }}</p>
            <p class="text-gray-600 font-mono">{{ order.driver?.phone_number || 'N/A' }}</p>
          </div>
          <!-- معلومات المحطة -->
          <div>
            <p class="text-sm font-semibold text-gray-500 uppercase mb-2">بيانات المحطة:</p>
            <p class="text-lg font-bold text-gray-800">{{ order.station?.name || 'غير محدد' }}</p>
            <p class="text-gray-600">
              {{ order.station?.company?.name || 'N/A' }} -
              {{ order.station?.region?.name || 'N/A' }}
            </p>
          </div>
        </section>

        <!-- 3. جدول تفاصيل الطلب -->
        <section>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">تفاصيل الطلب</h3>
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="w-full text-right">
              <thead class="bg-gray-50 text-sm text-gray-600 uppercase">
                <tr>
                  <th class="py-3 px-4 font-semibold">البيان</th>
                  <th class="py-3 px-4 font-semibold text-left">القيمة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr class="text-sm text-gray-700">
                  <td class="py-4 px-4 font-medium">حالة الطلب</td>
                  <td class="py-4 px-4 text-left">
                    <span
                      v-if="order.status"
                      class="font-bold py-1 px-3 rounded-full text-xs text-white"
                      :style="{ backgroundColor: order.status.color || '#6c757d' }"
                    >
                      {{ order.status.name }}
                    </span>
                  </td>
                </tr>
                <tr class="text-sm text-gray-700 bg-gray-50">
                  <td class="py-4 px-4 font-medium">تاريخ الطلب</td>
                  <td class="py-4 px-4 text-left font-mono">{{ order.order_date }}</td>
                </tr>
                <tr class="text-sm text-gray-700">
                  <td class="py-4 px-4 font-medium">نوع المنتج</td>
                  <td class="py-4 px-4 text-left font-bold">
                    {{ order.product?.name || 'غير محدد' }}
                  </td>
                </tr>
                <tr class="text-sm text-gray-700 bg-gray-50">
                  <td class="py-4 px-4 font-medium">الكمية المطلوبة</td>
                  <td class="py-4 px-4 text-left font-mono font-bold text-lg">
                    {{ order.quantity }} لتر
                  </td>
                </tr>
                <tr class="text-sm text-gray-700">
                  <td class="py-4 px-4 font-medium">ملاحظات</td>
                  <td class="py-4 px-4 text-left">{{ order.notes || 'لا توجد' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4. تذييل التقرير -->
        <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>تاريخ الطباعة: {{ new Date().toLocaleString() }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFuelOrderStore } from '@/stores/fuelOrderStore'
import AppButton from '@/components/ui/AppButton.vue' // تأكد من صحة المسار
import { PrinterIcon, TruckIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const store = useFuelOrderStore()

// استخدام computed لجلب البيانات من المخزن
const order = computed(() => store.fuelOrder)
const loading = computed(() => store.loading)
const error = ref(null) // خطأ محلي للصفحة

onMounted(async () => {
  const orderId = route.params.id
  if (orderId) {
    try {
      // نحتاج لدالة تجلب طلب واحد مع كل علاقاته
      await store.fetchOneFuelOrder(orderId)
    } catch (e) {
      error.value = 'لم يتم العثور على الطلب أو حدث خطأ أثناء جلبه.'
      console.error(e)
    }
  } else {
    error.value = 'لم يتم تحديد رقم الطلب.'
  }
})

const triggerPrint = () => window.print()
</script>

<style>
/* نفس أنماط الطباعة من ملف الفاتورة الأصلي */
:root {
  --color-primary: #1f2937; /* Gray-800 */
  --color-primary-dark: #111827; /* Gray-900 */
}
.shape-bg {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
}
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
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  .print\:bg-primary {
    background-color: var(--color-primary) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print\:mt-0 {
    margin-top: 0 !important;
  }
  .print\:relative {
    position: relative !important;
  }
  .print\:h-auto {
    height: auto !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:border-none {
    border: none !important;
  }
  .print\:bg-transparent {
    background-color: transparent !important;
  }
  .bg-gray-50 {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
