// src/services/fuelOrderService.js (الكود الصحيح والنهائي)
import apiClient from './apiClient'

const resource = '/fuel-orders'

export default {
  // --- [بداية الإصلاح] ---
  // تم تعديل الدالة لتقبل كائن "params" وتمريره بالطريقة الصحيحة
  get(params = {}) {
    // هذا الاستدعاء مطابق الآن للطريقة التي تعمل في reportService.js
    return apiClient.get(resource, { params })
  },
  // --- [نهاية الإصلاح] ---

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },
  create(payload) {
    return apiClient.post(resource, payload)
  },
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
