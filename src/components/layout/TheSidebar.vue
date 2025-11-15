<!-- src/components/layout/TheSidebar.vue (النسخة المطورة) -->
<template>
  <aside
    class="flex h-full flex-col bg-surface-section border-l border-surface-border lg:border-l-0 lg:border-r"
  >
    <!-- الشعار -->
    <div class="flex h-16 items-center justify-between px-5 flex-shrink-0">
      <RouterLink :to="{ name: 'Dashboard' }" class="flex items-center gap-2">
        <img src="/logo3.png" alt="Project Logo" class="w-8 h-8 rounded-md" />
        <h1 class="text-xl font-bold text-text-primary">الأسطول للنقل</h1>
      </RouterLink>
      <button
        @click="$emit('close-sidebar')"
        class="lg:hidden text-text-muted hover:text-text-primary"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- قائمة التنقل الجديدة -->
    <div class="flex flex-1 flex-col justify-between overflow-y-auto mt-4">
      <nav class="-mx-3 space-y-1 px-5">
        <template v-for="item in filteredNavLinks" :key="item.name">
          <!-- الحالة 1: رابط مباشر -->
          <RouterLink
            v-if="!item.children"
            :to="{ name: item.routeName }"
            class="nav-link"
            @click="$emit('close-sidebar')"
          >
            <component :is="item.icon" class="h-6 w-6" stroke-width="1.5" />
            <span class="mx-2 text-base font-medium">{{ item.name }}</span>
          </RouterLink>

          <!-- الحالة 2: مجموعة متداخلة -->
          <div v-else>
            <button
              @click="toggleGroup(item.name)"
              class="nav-group-button"
              :class="{ 'text-primary': isGroupActive(item) }"
            >
              <div class="flex items-center">
                <component :is="item.icon" class="h-6 w-6" stroke-width="1.5" />
                <span class="mx-2 text-base font-medium">{{ item.name }}</span>
              </div>
              <ChevronDownIcon
                class="h-5 w-5 transform transition-transform duration-200"
                :class="{ 'rotate-180': isGroupOpen(item.name) }"
              />
            </button>

            <!-- القائمة الفرعية -->
            <transition
              enter-active-class="transition-all ease-in-out duration-300"
              leave-active-class="transition-all ease-in-out duration-200"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-screen opacity-100"
              leave-from-class="max-h-screen opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-show="isGroupOpen(item.name)" class="mt-1 space-y-1 overflow-hidden">
                <RouterLink
                  v-for="child in item.children"
                  :key="child.name"
                  :to="{ name: child.routeName }"
                  class="nav-link nav-sub-link"
                  @click="$emit('close-sidebar')"
                >
                  <span class="mx-2 text-sm font-medium">{{ child.name }}</span>
                </RouterLink>
              </div>
            </transition>
          </div>
        </template>
      </nav>

      <!-- زر تسجيل الخروج -->
      <div class="mt-auto border-t border-surface-border px-2 pt-4">
        <a @click.prevent="handleLogout" href="#" class="nav-link text-danger hover:bg-danger/10">
          <ArrowLeftOnRectangleIcon class="h-6 w-6" stroke-width="1.5" />
          <span class="mx-2 text-base font-medium">تسجيل الخروج</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, shallowRef, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  HomeIcon,
  UserIcon,
  BuildingOffice2Icon,
  UsersIcon,
  TruckIcon,
  MapPinIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  BeakerIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  ListBulletIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['close-sidebar'])

const authStore = useAuthStore()
const route = useRoute()

// --- [تم التعديل هنا] ---
// بنية البيانات الجديدة للقائمة المتداخلة
const allNavLinks = shallowRef([
  { name: 'لوحة التحكم', routeName: 'Dashboard', icon: HomeIcon, permission: 'dashboard.view' },
  {
    name: 'البيانات الأساسية',
    icon: ArchiveBoxIcon,
    permission: 'company.view', // صلاحية المجموعة هي صلاحية أول عنصر فيها
    children: [
      { name: 'الشركات', routeName: 'CompaniesList', permission: 'company.view' },
      { name: 'المناطق', routeName: 'RegionsList', permission: 'region.view' },
      { name: 'المحطات', routeName: 'StationsList', permission: 'station.view' },
      { name: 'طبيعة العمل', routeName: 'work-natures', permission: 'order_status.view' },
      { name: 'السائقون', routeName: 'DriversList', permission: 'driver.view' },
      { name: 'الشاحنات', routeName: 'TrucksList', permission: 'truck.view' },
      { name: 'المنتجات', routeName: 'ProductsList', permission: 'product.view' },
      { name: 'حالات الطلب', routeName: 'OrderStatusesList', permission: 'order_status.view' },
    ],
  },
  {
    name: 'العمليات',
    icon: ShoppingCartIcon,
    permission: 'fuel_order.view',
    children: [
      { name: 'طلبات الوقود', routeName: 'FuelOrdersList', permission: 'fuel_order.view' },
    ],
  },
  {
    name: 'الإدارة',
    icon: Cog6ToothIcon,
    permission: 'user.view',
    children: [
      { name: 'المستخدمون', routeName: 'UsersList', permission: 'user.view' },
      { name: 'الأدوار والصلاحيات', routeName: 'RolesList', permission: 'role.view' },
    ],
  },
  {
    name: 'التقارير',
    icon: DocumentChartBarIcon,
    permission: 'driver.view', // مثال، يمكن استخدام صلاحية عامة للتقارير
    children: [
      { name: 'تقرير السائقين', routeName: 'DriverReport', permission: 'driver.view' },
      { name: 'تقرير المحطات', routeName: 'StationReport', permission: 'station.view' },
      { name: 'تقرير الطلبات', routeName: 'OrderReport', permission: 'fuel_order.view' },
    ],
  },
])

const isGroupActive = (group) => {
  if (!group.children) return false
  return group.children.some((child) => child.routeName === route.name)
}

// تصفية الروابط بناءً على صلاحيات المستخدم
const filteredNavLinks = computed(() => {
  const filterChildren = (children) => children.filter((child) => authStore.can(child.permission))

  return allNavLinks.value
    .filter((item) => authStore.can(item.permission))
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterChildren(item.children)
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren }
        }
        return null // إزالة المجموعة إذا كانت فارغة
      }
      return item
    })
    .filter(Boolean) // إزالة العناصر الفارغة (null)
})

// --- [إضافات جديدة لإدارة المجموعات] ---
const openGroups = ref([])

const toggleGroup = (groupName) => {
  if (openGroups.value.includes(groupName)) {
    openGroups.value = openGroups.value.filter((g) => g !== groupName)
  } else {
    openGroups.value.push(groupName)
  }
}

const isGroupOpen = (groupName) => {
  return openGroups.value.includes(groupName)
}

// دالة لفتح المجموعة الحالية عند تحميل الصفحة أو تغيير المسار
const setActiveGroup = () => {
  const currentRouteName = route.name
  for (const group of filteredNavLinks.value) {
    if (group.children && group.children.some((child) => child.routeName === currentRouteName)) {
      if (!isGroupOpen(group.name)) {
        openGroups.value.push(group.name)
      }
      return // توقف عند أول تطابق
    }
  }
}

// مراقبة تغيير المسار لفتح المجموعة الصحيحة
watch(route, setActiveGroup, { immediate: true })

// --- [نهاية الإضافات] ---

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center rounded-lg px-3 py-2.5 text-text-secondary transition-colors duration-300 transform;
}
.nav-link:hover {
  @apply bg-surface-border text-text-primary;
}

.router-link-exact-active {
  @apply bg-gradient-to-b from-primary-light to-primary-dark text-white;

  --tw-shadow-color: theme('colors.primary.DEFAULT');
  --tw-shadow: 0 4px 14px 0 var(--tw-shadow-color);
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);

  --tw-shadow-opacity: 0.3;
  --tw-shadow-color: rgba(theme('colors.primary.DEFAULT'), var(--tw-shadow-opacity));
}

/* --- [بداية التعديل المهم] --- */
.nav-sub-link.router-link-exact-active {
  @apply bg-gradient-to-b from-primary-light to-primary-dark; /* تطبيق نفس التدرج */
  @apply text-white; /* تغيير لون النص إلى الأبيض */
  @apply border-r-4 border-primary-dark; /* استخدام درجة أغمق للخط الجانبي للتباين */
  box-shadow: none;
}
/* --- [نهاية التعديل المهم] --- */

.nav-group-button {
  @apply flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-text-secondary transition-colors duration-300 transform;
}
.nav-group-button:hover {
  @apply bg-surface-border text-text-primary;
}
</style>
