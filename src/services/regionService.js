import apiClient from './apiClient'

export default {
  getRegions(params) {
    return apiClient.get('/regions', { params })
  },
  getRegion(id) {
    return apiClient.get(`/regions/${id}`)
  },
  createRegion(data) {
    return apiClient.post('/regions', data)
  },
  updateRegion(id, data) {
    return apiClient.put(`/regions/${id}`, data)
  },
  deleteRegion(id) {
    return apiClient.delete(`/regions/${id}`)
  },
}
