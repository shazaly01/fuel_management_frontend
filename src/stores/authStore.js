// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'
// [الحل] قم بإزالة السطر التالي
// import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    permissions: (state) => {
      if (state.user && state.user.roles) {
        const allPermissions = state.user.roles.flatMap((role) =>
          // [تأكيد] هذا السطر سيعمل الآن لأن الباك ايند يرسل الصلاحيات
          role.permissions.map((p) => p.name),
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    async login(credentials) {
      // تم حذف try/catch من هنا لنقله إلى المكون
      const response = await authService.login(credentials)
      const { access_token, user } = response.data

      this.token = access_token
      this.user = user

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed:', error)
      }

      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // [ملاحظة] هذا السطر قد يسبب نفس المشكلة. الحل الأفضل هو أن يقوم المكون الذي يستدعي logout بالتوجيه.
      // لكن يمكننا تركه الآن والتركيز على مشكلة تسجيل الدخول.
      // router.push('/login') // سنعود لهذه النقطة لاحقًا إذا لزم الأمر
      window.location.pathname = '/login' // حل بديل ومباشر
    },

    can(permissionName) {
      // [ملاحظة هامة] يجب أن نتحقق من حالة Super Admin هنا أيضًا!
      if (this.user && this.user.roles.some((role) => role.name === 'Super Admin')) {
        return true
      }
      return this.permissions.includes(permissionName)
    },
  },
})
