// src/stores/productStore.js
import { defineStore } from 'pinia'
import productService from '@/services/productService'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    product: null,
    pagination: {},
    loading: false,
  }),

  actions: {
    async fetchProducts(page = 1) {
      this.loading = true
      try {
        const response = await productService.get(page)
        this.products = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch products:', error)
        this.products = [] // إجراء وقائي
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneProduct(id) {
      this.loading = true
      try {
        const response = await productService.find(id)
        this.product = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProduct(payload) {
      try {
        await productService.create(payload)
      } catch (error) {
        console.error('Failed to create product:', error)
        throw error
      }
    },

    async updateProduct(id, payload) {
      try {
        await productService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update product ${id}:`, error)
        throw error
      }
    },

    async deleteProduct(id) {
      try {
        await productService.delete(id)
        // لا نقوم بالفلترة هنا، بل نعتمد على fetchProducts لتحديث القائمة
      } catch (error) {
        console.error(`Failed to delete product ${id}:`, error)
        throw error
      }
    },
  },
})
