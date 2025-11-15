<template>
  <AppTable
    :headers="tableHeaders"
    :items="drivers"
    :is-loading="isLoading"
    @row-click="$emit('show-orders', $event)"
    row-hover-class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
  >
    <!-- === [جديد] عمود الطلبيات === -->
    <!-- === [تعديل] عمود الطلبيات المدمج === -->
    <template #cell-orders="{ item }">
      <div class="flex items-center justify-center space-x-4 space-x-reverse p-2">
        <!-- زر إضافة طلبية جديد (أيقونة) -->
        <button
          @click.stop="$emit('create-order', item)"
          class="p-2 text-green-500 hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="إضافة طلبية جديدة"
        >
          <!-- أيقونة شاحنة وقود مع علامة "+" -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10M13 16l-4-4h10l4 4h-4"
            />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 10h-4m4 0l-4-4m4 4v4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10h4" />
          </svg>
        </button>

        <!-- فاصل بصري -->
        <div class="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>

        <!-- عرض عدد الطلبيات -->
        <div class="text-center">
          <p class="font-bold text-lg text-primary">{{ item.fuel_orders_count }}</p>
          <p class="text-xs text-gray-500 dark:text-text-muted">طلبية</p>
        </div>
      </div>
    </template>

    <!-- عمود اسم السائق (تم نقله من tableHeaders) -->
    <template #cell-name="{ item }">
      <span class="font-semibold">{{ item.name }}</span>
    </template>

    <!-- عمود الاتصال (يبقى كما هو) -->
    <template #cell-contact="{ item }">
      <div v-if="item.phone_number" class="flex items-center space-x-3 space-x-reverse">
        <span>{{ item.phone_number }}</span>
        <div class="flex items-center space-x-2 space-x-reverse">
          <a
            :href="`tel:${item.phone_number}`"
            @click.stop
            class="text-green-500 hover:text-green-400"
            title="اتصال مباشر"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
              />
            </svg>
          </a>
          <a
            :href="`https://wa.me/${item.phone_number.replace(/\D/g, '')}`"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
            class="text-emerald-500 hover:text-emerald-400"
            title="مراسلة عبر واتساب"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.081l-1.214 4.425 4.525-1.189z"
              />
            </svg>
          </a>
        </div>
      </div>
      <span v-else class="text-gray-400">--</span>
    </template>

    <!-- تفاصيل الشاحنة (يبقى كما هو ) -->
    <template #cell-truck_details="{ item }">
      <div v-if="item.truck" class="text-sm">
        <ul class="list-disc list-inside">
          <li><strong>الرقم:</strong> {{ item.truck.truck_number }}</li>
          <li>
            <strong>النوع:</strong>
            <span class="mr-1">{{ item.truck.truck_type || '--' }}</span>
            <span v-if="item.truck.color" class="text-yellow-500">- {{ item.truck.color }}</span>
          </li>
          <li><strong>المقطورة:</strong> {{ item.truck.trailer_number }}</li>
        </ul>
      </div>
      <span v-else class="text-gray-400">--</span>
    </template>

    <!-- تفاصيل السائق (يبقى كما هو) -->
    <template #cell-driver_details="{ item }">
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li v-if="item.address">
          <strong>العنوان:</strong> <span class="mr-1">{{ item.address }}</span>
        </li>
        <li v-if="item.work_nature">
          <strong>طبيعة العمل:</strong> <span class="mr-1">{{ item.work_nature.name }}</span>
        </li>
      </ul>
      <span v-if="!item.address && !item.work_nature" class="text-gray-400">--</span>
    </template>

    <!-- الحالة (يبقى كما هو) -->
    <template #cell-status="{ item }">
      <span
        class="px-2 py-1 text-xs font-semibold rounded-full"
        :class="statusClasses[item.status] || 'bg-gray-200 text-gray-800'"
      >
        {{ statusTranslations[item.status] || item.status }}
      </span>
    </template>

    <!-- === [تعديل] عمود الإجراءات === -->
    <template #cell-actions="{ item }">
      <div class="flex items-center justify-end space-x-2 space-x-reverse">
        <!-- زر عرض المستند (أيقونة ) -->
        <button
          v-if="item.document_image_url"
          @click.stop="$emit('preview-image', item.document_image_url)"
          class="p-2 text-sky-500 hover:text-sky-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="عرض صورة المستند"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>

        <!-- فاصل بصري -->
        <div class="h-6 w-px bg-gray-200 dark:bg-gray-600"></div>

        <!-- زر التعديل (نص ) -->
        <button
          @click.stop="$emit('edit', item)"
          class="font-medium text-blue-500 hover:text-blue-700 px-2"
        >
          تعديل
        </button>

        <!-- زر الحذف (نص) -->
        <button
          @click.stop="$emit('delete', item)"
          class="font-medium text-danger hover:text-red-700 px-2"
        >
          حذف
        </button>
      </div>
    </template>
  </AppTable>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'

// تعريف المدخلات (Props)
defineProps({
  drivers: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
})

// === [بداية التعديل هنا] ===
// تعريف المخرجات (Emits) - تم إضافة الأحداث الجديدة
const emit = defineEmits(['show-orders', 'create-order', 'edit', 'delete', 'preview-image'])
// === [نهاية التعديل هنا] ===

// === [بداية التعديل هنا] ===
// تعريفات العرض (رؤوس الجدول، الترجمات، الألوان)
const tableHeaders = [
  { key: 'orders', label: 'الطلبيات', class: 'w-24 text-center' },
  { key: 'name', label: 'اسم السائق' },
  { key: 'contact', label: 'اتصال', class: 'w-48' },
  { key: 'truck_details', label: 'تفاصيل الشاحنة' },
  { key: 'driver_details', label: 'تفاصيل إضافية' },
  { key: 'status', label: 'الحالة' },
  // تم حذف عمود 'document' ودمجه في 'actions'
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]
// === [نهاية التعديل هنا] ===

const statusTranslations = {
  available: 'متاح',
  on_trip: 'في رحلة',
  unavailable: 'غير متاح',
}
const statusClasses = {
  available: 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100',
  on_trip: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  unavailable: 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100',
}
</script>
