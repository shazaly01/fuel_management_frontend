<!-- src/views/users/UserForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="user-full-name"
        label="الاسم الكامل"
        v-model="form.full_name"
        placeholder="ادخل الاسم الكامل"
        required
      />

      <AppInput
        id="user-username"
        label="اسم المستخدم"
        v-model="form.username"
        placeholder="ادخل اسم المستخدم"
        required
      />

      <RolesDropdown id="user-role" label="الدور" v-model="form.roles[0]" required />

      <!-- حقول كلمة المرور تظهر فقط عند إنشاء مستخدم جديد، أو عند الرغبة في تغييرها -->
      <div class="border-t border-surface-border pt-4 mt-4">
        <h4 class="font-semibold text-text-secondary mb-2">
          {{ form.id ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور' }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            id="user-password"
            label="كلمة المرور"
            type="password"
            v-model="form.password"
            :required="!form.id"
            autocomplete="new-password"
          />
          <AppInput
            id="user-password-confirmation"
            label="تأكيد كلمة المرور"
            type="password"
            v-model="form.password_confirmation"
            :required="!form.id || form.password"
            autocomplete="new-password"
          />
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import RolesDropdown from '@/components/forms/RolesDropdown.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// تعريف بنية النموذج
const form = ref({
  id: null,
  full_name: '',
  username: '',
  password: '',
  password_confirmation: '',
  roles: [], // مصفوفة من أسماء الأدوار
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        full_name: newData.full_name,
        username: newData.username,
        password: '', // كلمة المرور تترك فارغة عند التعديل
        password_confirmation: '',
        // استخراج اسم الدور الأول
        roles: newData.roles ? newData.roles.map((r) => r.name) : [],
      }
    } else {
      // إعادة تعيين النموذج عند إضافة مستخدم جديد
      form.value = {
        id: null,
        full_name: '',
        username: '',
        password: '',
        password_confirmation: '',
        roles: [],
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // إزالة حقول كلمة المرور إذا كانت فارغة عند التحديث
  const payload = { ...form.value }
  if (payload.id && !payload.password) {
    delete payload.password
    delete payload.password_confirmation
  }
  emit('submit', payload)
}
</script>
