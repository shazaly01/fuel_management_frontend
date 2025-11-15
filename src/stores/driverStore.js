// src/stores/driverStore.js
import { defineStore } from 'pinia'
import driverService from '@/services/driverService'

export const useDriverStore = defineStore('drivers', {
  state: () => ({
    drivers: [],
    driver: null,
    pagination: {},
    loading: false,
  }),

  actions: {
    async fetchDrivers(page = 1, filters = {}) {
      this.loading = true
      try {
        const response = await driverService.get(page, filters)
        this.drivers = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch drivers:', error)
        this.drivers = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneDriver(id) {
      this.loading = true
      try {
        const response = await driverService.find(id)
        this.driver = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch driver ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createDriver(payload) {
      try {
        await driverService.create(payload)
      } catch (error) {
        console.error('Failed to create driver:', error)
        throw error
      }
    },

    async updateDriver(id, payload) {
      try {
        await driverService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update driver ${id}:`, error)
        throw error
      }
    },

    async deleteDriver(id) {
      try {
        await driverService.delete(id)
        this.drivers = this.drivers.filter((d) => d.id !== id)
      } catch (error) {
        console.error(`Failed to delete driver ${id}:`, error)
        throw error
      }
    },
  },
})
