import { defineStore } from 'pinia'
import fuelOrderService from '@/services/fuelOrderService'

export const useFuelOrderStore = defineStore('fuelOrders', {
  state: () => ({
    fuelOrders: [],
    fuelOrder: null,
    pagination: {},
    loading: false,
    reportFilters: {},
    // --- [بداية التعديل] ---
    // متغير لتخزين بيانات التقرير مؤقتًا
    reportData: {
      items: [],
      filters: {},
    },
    // --- [نهاية التعديل] ---
  }),

  actions: {
    setReportData(items, filters) {
      this.reportData.items = items

      // --- [بداية الإصلاح] ---
      // نفس المنطق، ولكننا لا ننشئ متغير "page" غير مستخدم.
      // هذا يزيل تحذير ESLint.
      const { page, ...cleanFilters } = filters
      this.reportData.filters = cleanFilters
      // --- [نهاية الإصلاح] ---
    },

    setReportFilters(filters) {
      this.reportFilters = filters
    },

    async fetchFuelOrders(params) {
      this.loading = true
      try {
        // يتم تمرير الكائن "params" مباشرة إلى الخدمة
        const response = await fuelOrderService.get(params)

        this.fuelOrders = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch fuel orders:', error)
        this.fuelOrders = []
        throw error
      } finally {
        this.loading = false
      }
    },
    // --- [نهاية التعديل] ---

    async fetchOneFuelOrder(id) {
      this.loading = true
      try {
        const response = await fuelOrderService.find(id)
        this.fuelOrder = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch fuel order ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createFuelOrder(payload) {
      try {
        await fuelOrderService.create(payload)
      } catch (error) {
        console.error('Failed to create fuel order:', error)
        throw error
      }
    },

    async updateFuelOrder(id, payload) {
      try {
        await fuelOrderService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update fuel order ${id}:`, error)
        throw error
      }
    },

    async deleteFuelOrder(id) {
      try {
        await fuelOrderService.delete(id)
        this.fuelOrders = this.fuelOrders.filter((order) => order.id !== id)
      } catch (error) {
        console.error(`Failed to delete fuel order ${id}:`, error)
        throw error
      }
    },
  },
})
