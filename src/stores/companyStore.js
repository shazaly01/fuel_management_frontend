// src/stores/companyStore.js (النسخة النهائية المصححة)
import { defineStore } from 'pinia'
import companyService from '@/services/companyService'

export const useCompanyStore = defineStore('companies', {
  state: () => ({
    companies: [], // القيمة الابتدائية هي مصفوفة فارغة
    company: null,
    pagination: {},
    loading: false,
  }),

  actions: {
    async fetchCompanies(page = 1) {
      this.loading = true
      try {
        const response = await companyService.get(page)
        // التأكد من أن response.data.data هي مصفوفة
        this.companies = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        this.companies = [] // [الإصلاح الحاسم] في حالة حدوث أي خطأ، أعدها إلى مصفوفة فارغة
        throw error
      } finally {
        this.loading = false
      }
    },

    // ... (باقي الإجراءات)

    async createCompany(payload) {
      try {
        await companyService.create(payload)
      } catch (error) {
        console.error('Failed to create company:', error)
        throw error
      }
    },

    async updateCompany(id, payload) {
      try {
        await companyService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update company ${id}:`, error)
        throw error
      }
    },

    async deleteCompany(id) {
      try {
        await companyService.delete(id)
        // سيتم إعادة الجلب من المكون، لذلك لا حاجة لتعديل الحالة هنا
      } catch (error) {
        console.error(`Failed to delete company ${id}:`, error)
        throw error
      }
    },
  },
})
