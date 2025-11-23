// src/services/reportService.js
import apiClient from './apiClient'

export default {
  getDashboardStats() {
    return apiClient.get('/dashboard')
  },
  /**
   * جلب بيانات تقرير السائقين.
   * @param {object} filters - كائن يحتوي على الفلاتر.
   */
  getDriverReport(filters = {}) {
    return apiClient.get('/reports/drivers', { params: filters })
  },
  getOrderReport(params) {
    return apiClient.get('/reports/orders', { params })
  },
  getStationReport(params) {
    return apiClient.get('/reports/stations', { params })
  },
  /**
   * Fetches the movement order report data.
   * @param {object} params - The query parameters for the report (e.g., { date, company_id }).
   * @returns {Promise} - The Axios promise for the API request.
   */
  getMovementOrderReport(params) {
    return apiClient.get('/reports/movement-order', { params })
  },
}
