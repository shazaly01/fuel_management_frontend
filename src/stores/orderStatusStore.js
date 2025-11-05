// src/stores/orderStatusStore.js
import { defineStore } from 'pinia'
import orderStatusService from '@/services/orderStatusService'

export const useOrderStatusStore = defineStore('orderStatuses', {
  state: () => ({
    orderStatuses: [],
    orderStatus: null,
    // لا نحتاج لـ pagination هنا
    loading: false,
  }),

  actions: {
    async fetchOrderStatuses() {
      this.loading = true
      try {
        const response = await orderStatusService.get()
        // الـ API يرجع مصفوفة مباشرة لأننا أزلنا الترقيم
        this.orderStatuses = response.data.data || []
      } catch (error) {
        console.error('Failed to fetch order statuses:', error)
        this.orderStatuses = [] // إجراء وقائي
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrderStatus(payload) {
      try {
        await orderStatusService.create(payload)
      } catch (error) {
        console.error('Failed to create order status:', error)
        throw error
      }
    },

    async updateOrderStatus(id, payload) {
      try {
        await orderStatusService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update order status ${id}:`, error)
        throw error
      }
    },

    async deleteOrderStatus(id) {
      try {
        await orderStatusService.delete(id)
      } catch (error) {
        console.error(`Failed to delete order status ${id}:`, error)
        throw error
      }
    },
  },
})
