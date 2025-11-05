<!-- src/views/roles/RolePermissionsDialog.vue -->
<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <div v-if="isLoading" class="text-center py-8">جاري التحميل...</div>
    <!-- [تعديل] التحقق من وجود بيانات قبل العرض -->
    <div v-else-if="permissionGroups.length === 0" class="text-center py-8">
      لا توجد صلاحيات لعرضها.
    </div>
    <div v-else>
      <div class="max-h-[60vh] overflow-y-auto border border-surface-border rounded-md">
        <table class="min-w-full divide-y divide-surface-border">
          <thead class="bg-surface-section sticky top-0 z-10">
            <tr>
              <th class="p-3 font-bold text-text-primary text-right">المجموعة</th>
              <!-- [تعديل] بناء الأعمدة ديناميكيًا من actions -->
              <th
                v-for="action in permissionActions"
                :key="action.key"
                class="p-3 font-bold text-text-primary text-center"
              >
                {{ action.display_name }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <!-- [تعديل] المرور على المجموعات مباشرة -->
            <tr v-for="group in permissionGroups" :key="group.key">
              <td class="p-3 font-semibold text-text-primary">
                {{ group.display_name }}
              </td>
              <!-- [تعديل] بناء الخلايا ديناميكيًا -->
              <td v-for="action in permissionActions" :key="action.key" class="p-3 text-center">
                <!-- البحث عن الصلاحية المطابقة للمجموعة والإجراء -->
                <template v-if="getPermissionFor(group, action.key)">
                  <input
                    type="checkbox"
                    :value="getPermissionFor(group, action.key).id"
                    v-model="selectedPermissions"
                    class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </template>
                <span v-else class="text-text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات' }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  role: Object,
  isLoading: Boolean,
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const roleStore = useRoleStore()
const selectedPermissions = ref([])

const dialogTitle = computed(() => `تعديل صلاحيات دور: ${props.role?.name || ''}`)

// --- [بداية التعديلات الجوهرية] ---

// جلب المجموعات والإجراءات من المخزن مباشرة
const permissionGroups = computed(() => roleStore.permissions.groups || [])
const permissionActions = computed(() => roleStore.permissions.actions || [])

// دالة مساعدة للبحث عن صلاحية معينة داخل مجموعة
function getPermissionFor(group, actionKey) {
  return group.permissions.find((p) => p.action === actionKey)
}

// --- [نهاية التعديلات الجوهرية] ---

watch(
  () => props.role,
  (newRole) => {
    if (newRole && newRole.permissions) {
      selectedPermissions.value = newRole.permissions.map((p) => p.id)
    } else {
      selectedPermissions.value = []
    }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!props.role) return

  // 1. إنشاء خريطة (Map) للبحث السريع عن أسماء الصلاحيات باستخدام الـ ID
  const allPermissionsMap = new Map()
  roleStore.permissions.groups.forEach((group) => {
    group.permissions.forEach((p) => {
      // اسم الصلاحية الكامل هو "group.action"
      const permissionName = `${group.key}.${p.action}`
      allPermissionsMap.set(p.id, permissionName)
    })
  })

  // 2. تحويل مصفوفة الـ IDs المحددة إلى مصفوفة أسماء (strings)
  const permissionNames = selectedPermissions.value
    .map((id) => allPermissionsMap.get(id))
    .filter((name) => name) // فلترة أي قيم غير صالحة

  // 3. بناء الحمولة (payload) الكاملة التي يتوقعها الخادم
  const payload = {
    name: props.role.name, // إرسال الاسم الحالي لتجاوز التحقق
    permissions: permissionNames, // إرسال مصفوفة الأسماء
  }

  // 4. إرسال الحمولة الكاملة إلى الحدث submit
  emit('submit', payload)
}
</script>
