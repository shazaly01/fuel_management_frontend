// src/stores/workNatureStore.js
import { defineStore } from 'pinia'
import workNatureService from '@/services/workNatureService'

export const useWorkNatureStore = defineStore('workNatures', {
  state: () => ({
    workNatures: [],
    pagination: {},
    loading: false,
  }),

  actions: {
    async fetchWorkNatures(params = {}) {
      this.loading = true
      try {
        const response = await workNatureService.get(params)
        // نفترض أن الـ API قد يرجع بيانات مرقمة أو قائمة كاملة
        this.workNatures = response.data.data || response.data
        if (response.data.meta) {
          this.pagination = response.data.meta
        }
      } catch (error) {
        console.error('Failed to fetch work natures:', error)
        this.workNatures = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async createWorkNature(payload) {
      try {
        return await workNatureService.create(payload)
      } catch (error) {
        console.error('Failed to create work nature:', error)
        throw error
      }
    },

    async updateWorkNature(id, payload) {
      try {
        return await workNatureService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update work nature ${id}:`, error)
        throw error
      }
    },

    async deleteWorkNature(id) {
      try {
        await workNatureService.delete(id)
        // تحديث الحالة المحلية بعد الحذف
        this.workNatures = this.workNatures.filter((wn) => wn.id !== id)
      } catch (error) {
        console.error(`Failed to delete work nature ${id}:`, error)
        throw error
      }
    },
  },
})
