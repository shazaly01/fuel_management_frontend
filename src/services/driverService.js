import apiClient from './apiClient'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// نسخة axios مخصصة لرفع الملفات (تبقى كما هي)
const apiClientWithFiles = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Interceptor للنسخة المخصصة (يبقى كما هو)
apiClientWithFiles.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

const resource = '/drivers'

export default {
  // --- بداية التعديل ---
  /**
   * جلب قائمة السائقين مع دعم الترقيم والفلاتر.
   * @param {number} page - رقم الصفحة.
   * @param {object} filters - كائن يحتوي على الفلاتر (search, status, etc.).
   */
  get(page = 1, filters = {}) {
    // 1. دمج رقم الصفحة مع الفلاتر في كائن واحد
    const allParams = {
      page,
      ...filters,
    }

    // 2. إنشاء كائن URLSearchParams
    const params = new URLSearchParams()

    // 3. إضافة البارامترات فقط إذا كانت لها قيمة
    for (const key in allParams) {
      const value = allParams[key]
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    }

    // 4. إرسال الطلب مع سلسلة الاستعلام المبنية
    return apiClient.get(`${resource}?${params.toString()}`)
  },
  // --- نهاية التعديل ---

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // دالة الإنشاء (تبقى كما هي)
  create(payload) {
    if (payload instanceof FormData) {
      return apiClientWithFiles.post(resource, payload)
    }
    return apiClient.post(resource, payload)
  },

  // دالة التحديث (تبقى كما هي)
  update(id, payload) {
    if (payload instanceof FormData) {
      return apiClientWithFiles.post(`${resource}/${id}`, payload)
    }
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // دالة الحذف (تبقى كما هي)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
