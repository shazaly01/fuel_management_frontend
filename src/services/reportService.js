// src/services/reportService.js
import apiClient from './apiClient'

export default {
  getDashboardStats() {
    return apiClient.get('/dashboard')
  },
  getDriverReport(params) {
    return apiClient.get('/reports/drivers', { params })
  },
  getOrderReport(params) {
    return apiClient.get('/reports/orders', { params })
  },
  getStationReport(params) {
    return apiClient.get('/reports/stations', { params })
  },
}
