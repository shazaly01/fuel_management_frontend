// src/services/workNatureService.js
import apiClient from './apiClient'

const resource = '/work-natures'

export default {
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
