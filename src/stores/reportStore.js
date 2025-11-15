// src/stores/reportStore.js (النسخة النهائية والصحيحة)
import { defineStore } from 'pinia'
import reportService from '@/services/reportService'

export const useReportStore = defineStore('reports', {
  state: () => ({
    // --- [الإضافة الأساسية هنا] ---
    dashboardStats: null,
    // --- [نهاية الإضافة] ---

    // State for Driver Report
    driverReport: {
      data: [],
      pagination: {},
      loading: false,
    },
    // State for Order Report
    orderReport: {
      data: [],
      pagination: {},
      loading: false,
    },
    // State for Station Report
    stationReport: {
      data: [],
      pagination: {},
      loading: false,
    },
    movementOrderReport: {
      data: null, // يبدأ كـ null لأنه كائن واحد وليس مصفوفة
      loading: false,
      error: null,
    },
  }),

  actions: {
    // --- [الإضافة الأساسية هنا] ---
    async fetchDashboardStats() {
      try {
        const response = await reportService.getDashboardStats()
        this.dashboardStats = response.data.data
      } catch (error) {
        console.error('Failed to fetch dashboard stats from store:', error)
        this.dashboardStats = null
        throw error
      }
    },
    // --- [نهاية الإضافة] ---

    async fetchDriverReport(params = {}) {
      this.driverReport.loading = true
      try {
        const response = await reportService.getDriverReport(params)
        this.driverReport.data = response.data.data || []
        this.driverReport.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch driver report:', error)
        this.driverReport.data = []
        throw error
      } finally {
        this.driverReport.loading = false
      }
    },

    async fetchOrderReport(params = {}) {
      this.orderReport.loading = true
      try {
        const response = await reportService.getOrderReport(params)
        this.orderReport.data = response.data.data || []
        this.orderReport.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch order report:', error)
        this.orderReport.data = []
        throw error
      } finally {
        this.orderReport.loading = false
      }
    },

    async fetchStationReport(params = {}) {
      this.stationReport.loading = true
      try {
        const response = await reportService.getStationReport(params)
        this.stationReport.data = response.data.data || []
        this.stationReport.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch station report:', error)
        this.stationReport.data = []
        throw error
      } finally {
        this.stationReport.loading = false
      }
    },

    async fetchMovementOrderReport(params) {
      this.movementOrderReport.loading = true
      this.movementOrderReport.error = null
      try {
        const response = await reportService.getMovementOrderReport(params)
        // البيانات الفعلية موجودة داخل response.data.data
        this.movementOrderReport.data = response.data.data || null
      } catch (error) {
        console.error('Failed to fetch movement order report:', error)
        this.movementOrderReport.data = null
        // تخزين رسالة الخطأ لعرضها في الواجهة
        this.movementOrderReport.error = error.response?.data?.message || error.message
        throw error // السماح للمكون بمعرفة حدوث خطأ
      } finally {
        this.movementOrderReport.loading = false
      }
    },
  },
})
