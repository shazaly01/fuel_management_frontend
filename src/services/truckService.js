// src/services/truckService.js
import apiClient from './apiClient'

const resource = '/trucks'

export default {
  /**
   * [تصحيح] الدالة الآن تقبل كائن params وتمرره بشكل صحيح.
   * @param {object} params - كائن يحتوي على كل معاملات الاستعلام (e.g., { page: 1, truck_number: '123' }).
   */
  get(params = {}) {
    return apiClient.get(resource, { params })
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
