// src/stores/regionStore.js (النسخة المصححة)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import regionService from '@/services/regionService'
import { useToast } from 'vue-toastification'

export const useRegionStore = defineStore('region', () => {
  const regions = ref([])
  const pagination = ref(null) // <-- القيمة الافتراضية null أفضل
  const toast = useToast()

  // --- [تم التصحيح هنا] ---
  // تعيين قيمة افتراضية آمنة لـ params
  const fetchRegions = async (params = {}) => {
    try {
      const response = await regionService.getRegions(params)
      regions.value = response.data.data
      pagination.value = response.data.meta
      return response.data
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المناطق.')
      console.error(error)
      // إلقاء الخطأ للسماح للمكون بمعالجته (مثل إيقاف التحميل)
      throw error
    }
  }

  const addRegion = async (regionData) => {
    try {
      await regionService.createRegion(regionData)
      // لا تقم بإعادة الجلب هنا، المكون الأب سيفعل ذلك
      return true
    } catch (error) {
      console.error(error)
      // إلقاء الخطأ للسماح للمكون بمعالجته وعرض رسالة أفضل
      throw error
    }
  }

  const updateRegion = async (id, regionData) => {
    try {
      await regionService.updateRegion(id, regionData)
      // لا تقم بإعادة الجلب هنا، المكون الأب سيفعل ذلك
      return true
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteRegion = async (id) => {
    try {
      await regionService.deleteRegion(id)
      // تحديث القائمة عن طريق إزالة العنصر محليًا أو إعادة الجلب
      const currentPage = pagination.value?.current_page || 1
      await fetchRegions({ page: currentPage })
      toast.success('تم حذف المنطقة بنجاح.')
    } catch (error) {
      toast.error('فشلت عملية الحذف.')
      console.error(error)
      throw error
    }
  }

  return {
    regions,
    pagination,
    fetchRegions,
    addRegion,
    updateRegion,
    deleteRegion,
  }
})
