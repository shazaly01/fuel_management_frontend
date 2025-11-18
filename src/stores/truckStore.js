// src/stores/truckStore.js
import { defineStore } from 'pinia'
import truckService from '@/services/truckService'

export const useTruckStore = defineStore('trucks', {
  state: () => ({
    trucks: [],
    truck: null,
    pagination: {},
    loading: false,
    activeFilters: { page: 1 },
  }),

  actions: {
    async fetchTrucks(params = { page: 1 }) {
      this.loading = true
      this.activeFilters = params
      try {
        const response = await truckService.get(this.activeFilters)
        this.trucks = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch trucks:', error)
        this.trucks = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneTruck(id) {
      this.loading = true
      try {
        const response = await truckService.find(id)
        this.truck = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch truck ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTruck(payload) {
      try {
        await truckService.create(payload)
      } catch (error) {
        console.error('Failed to create truck:', error)
        throw error
      }
    },

    async updateTruck(id, payload) {
      try {
        await truckService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update truck ${id}:`, error)
        throw error
      }
    },

    async deleteTruck(id) {
      try {
        await truckService.delete(id)
        this.trucks = this.trucks.filter((t) => t.id !== id)
      } catch (error) {
        console.error(`Failed to delete truck ${id}:`, error)
        throw error
      }
    },
  },
})
