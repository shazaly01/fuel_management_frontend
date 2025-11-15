// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// استيراد التخطيطات الرئيسية (Layouts)
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// استيراد الصفحات الفعلية والنائبة
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import CompaniesList from '@/views/companies/CompaniesList.vue'
import StationsList from '@/views/stations/StationsList.vue'
import WorkNaturesList from '@/views/work-natures/WorkNaturesList.vue'
import DriversList from '@/views/drivers/DriversList.vue'
import TrucksList from '@/views/trucks/TrucksList.vue'
import ProductsList from '@/views/products/ProductsList.vue'
import OrderStatusesList from '@/views/order-statuses/OrderStatusesList.vue'
import FuelOrdersList from '@/views/fuel-orders/FuelOrdersList.vue'
import RolesList from '@/views/roles/RolesList.vue'
import UsersList from '@/views/users/UsersList.vue'
import RegionsList from '@/views/regions/RegionsList.vue'
import DriverReport from '@/views/reports/DriverReport.vue' // <-- [جديد]
import OrderReport from '@/views/reports/OrderReport.vue' // <-- [جديد]
import StationReport from '@/views/reports/StationReport.vue' // <-- [جديد]
import FuelOrderPrint from '@/views/print/FuelOrderPrint.vue'
import FuelOrdersReportPrint from '@/views/print/FuelOrdersReportPrint.vue'
import MovementOrderPrint from '@/views/print/MovementOrderPrint.vue'

const routes = [
  {
    path: '/print/fuel-order/:id',
    name: 'FuelOrderPrint',
    component: FuelOrderPrint,
    meta: { requiresAuth: true }, // لا يزال يتطلب مصادقة للوصول
  },
  {
    path: '/print/fuel-orders-report', // <-- المسار الجديد للتقرير
    name: 'FuelOrdersReportPrint',
    component: FuelOrdersReportPrint,
    meta: { requiresAuth: true },
  },
  {
    path: '/print/reports/movement-order', // مسار جديد ومستقل
    name: 'MovementOrderPrint',
    component: MovementOrderPrint, // <-- استخدام المكون الجديد
    meta: {
      requiresAuth: true, // لا يزال محميًا
    },
  },

  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: '', redirect: '/login' },
    ],
  },

  // --- المسارات المحمية (تتطلب مصادقة) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { permission: 'dashboard.view' },
      },

      // --- [الحل هنا] تم تفعيل جميع المسارات وجعلها تشير إلى المكون النائب ---
      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'companies',
        name: 'CompaniesList',
        component: CompaniesList,
        meta: { permission: 'company.view' },
      },
      {
        path: 'regions',
        name: 'RegionsList',
        component: RegionsList,
        meta: {
          permission: 'region.view',
        },
      },
      {
        path: '/work-natures',
        name: 'work-natures',
        component: WorkNaturesList,
        meta: { permission: 'driver.view' },
      },

      {
        path: 'drivers',
        name: 'DriversList',
        component: DriversList,
        meta: { permission: 'driver.view' },
      },
      {
        path: 'products',
        name: 'ProductsList',
        component: ProductsList, // <-- تم التغيير
        meta: { permission: 'product.view' },
      },
      {
        path: 'order-statuses',
        name: 'OrderStatusesList',
        component: OrderStatusesList, // <-- تم التغيير
        meta: { permission: 'order_status.view' },
      },
      {
        path: 'fuel-orders',
        name: 'FuelOrdersList',
        component: FuelOrdersList,
        meta: { permission: 'fuel_order.view' },
      },
      {
        path: 'stations',
        name: 'StationsList',
        component: StationsList,
        meta: { permission: 'station.view' },
      },
      {
        path: 'trucks',
        name: 'TrucksList',
        component: TrucksList,
        meta: { permission: 'truck.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },
      {
        path: 'reports/drivers',
        name: 'DriverReport',
        component: DriverReport, // <-- تم التغيير
        meta: { permission: 'driver.view' }, // الصلاحية موجودة مسبقًا
      },
      {
        path: 'reports/orders',
        name: 'OrderReport',
        component: OrderReport, // <-- تم التغيير
        meta: { permission: 'fuel_order.view' }, // الصلاحية موجودة مسبقًا
      },
      {
        path: 'reports/stations',
        name: 'StationReport',
        component: StationReport, // <-- تم التغيير
        meta: { permission: 'station.view' }, // الصلاحية موجودة مسبقًا
      },

      // إعادة توجيه المسار الرئيسي للتطبيق إلى لوحة التحكم
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // مسار للتعامل مع الصفحات غير الموجودة
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- حارس التنقل العام (Global Navigation Guard) ---
// (هذا الجزء يبقى كما هو بدون تغيير)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isAuthenticated, can } = authStore

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      if (requiredPermission && !can(requiredPermission)) {
        console.warn(
          `Access denied: route "${String(to.name)}" requires permission "${requiredPermission}"`,
        )
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
