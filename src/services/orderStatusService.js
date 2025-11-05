// src/services/orderStatusService.js
import apiClient from './apiClient'

const resource = '/order-statuses'

export default {
  // ملاحظة: قمنا بتعديل دالة index في الـ Controller لترجع كل الحالات بدون ترقيم
  get() {
    return apiClient.get(resource)
  },
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
