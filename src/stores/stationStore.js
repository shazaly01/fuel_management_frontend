// src/stores/stationStore.js
import { defineStore } from 'pinia'
import stationService from '@/services/stationService'

export const useStationStore = defineStore('stations', {
  state: () => ({
    stations: [],
    station: null,
    pagination: {},
    loading: false,
    activeFilters: { page: 1 },
  }),

  actions: {
    async fetchStations(params = { page: 1 }) {
      this.loading = true
      this.activeFilters = params

      try {
        // تمرير الكائن مباشرة إلى الخدمة المصححة
        const response = await stationService.get(this.activeFilters)
        this.stations = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch stations:', error)
        this.stations = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneStation(id) {
      this.loading = true
      try {
        const response = await stationService.find(id)
        this.station = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch station ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createStation(payload) {
      try {
        await stationService.create(payload)
      } catch (error) {
        console.error('Failed to create station:', error)
        throw error
      }
    },

    async updateStation(id, payload) {
      try {
        await stationService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update station ${id}:`, error)
        throw error
      }
    },

    async deleteStation(id) {
      try {
        await stationService.delete(id)
        this.stations = this.stations.filter((s) => s.id !== id)
      } catch (error) {
        console.error(`Failed to delete station ${id}:`, error)
        throw error
      }
    },
  },
})
