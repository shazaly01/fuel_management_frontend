<!-- src/views/users/UsersList.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المستخدمين</h1>
      <AppButton @click="openUserModal()"> إضافة مستخدم </AppButton>
    </div>

    <!-- جدول عرض المستخدمين -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="users || []"
        :is-loading="loading"
        @row-click="openUserModal"
      >
        <!-- تخصيص عرض خلية الدور -->
        <template #cell-role="{ item }">
          <span
            v-if="item.roles && item.roles.length > 0"
            class="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            {{ item.roles[0].name }}
          </span>
          <span v-else class="text-text-muted"> لا يوجد دور </span>
        </template>

        <!-- تخصيص عرض خلية الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openUserModal(item)"
              class="font-semibold text-blue-500 hover:text-blue-700"
            >
              تعديل
            </button>
            <!-- منع حذف المستخدم الذي يحمل دور Super Admin -->
            <button
              v-if="!hasSuperAdminRole(item)"
              @click.stop="openDeleteDialog(item)"
              class="font-semibold text-danger hover:text-red-700"
            >
              حذف
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- نافذة الإضافة والتعديل -->
    <UserModal
      v-model="isModalOpen"
      :user="selectedUser"
      :is-saving="isSaving"
      @save="handleSaveUser"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المستخدم"
      :message="`هل أنت متأكد من رغبتك في حذف المستخدم '${userToDelete?.full_name}'؟`"
      @confirmed="deleteSelectedUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import UserModal from './UserModal.vue'

// إعدادات
const userStore = useUserStore()
const { users, loading, pagination } = storeToRefs(userStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'full_name', label: 'الاسم الكامل' },
  { key: 'username', label: 'اسم المستخدم' },
  { key: 'role', label: 'الدور' },
  { key: 'created_at', label: 'تاريخ الإنشاء' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// دالة للتحقق من دور Super Admin
const hasSuperAdminRole = (user) => {
  return user.roles && user.roles.some((role) => role.name === 'Super Admin')
}

// منطق جلب البيانات والترقيم
const handlePageChange = (page) => {
  userStore.fetchUsers(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المستخدمين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedUser = ref(null)
const isSaving = ref(false)

const openUserModal = (user = null) => {
  // لا تسمح بتعديل مستخدم Super Admin
  if (user && hasSuperAdminRole(user)) {
    toast.info('لا يمكن تعديل مستخدم Super Admin.')
    return
  }
  selectedUser.value = user
  isModalOpen.value = true
}

const handleSaveUser = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await userStore.updateUser(formData.id, formData)
      toast.success(`تم تعديل المستخدم '${formData.full_name}' بنجاح.`)
    } else {
      await userStore.createUser(formData)
      toast.success(`تمت إضافة المستخدم '${formData.full_name}' بنجاح.`)
    }
    await userStore.fetchUsers(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const userToDelete = ref(null)

const openDeleteDialog = (user) => {
  userToDelete.value = user
  isDeleteDialogOpen.value = true
}

const deleteSelectedUser = async () => {
  if (userToDelete.value) {
    try {
      await userStore.deleteUser(userToDelete.value.id)
      // لا نحتاج لـ fetch هنا لأن الـ store يقوم بالفلترة
      toast.success(`تم حذف المستخدم '${userToDelete.value.full_name}' بنجاح.`)
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.'
      toast.error(message)
    } finally {
      userToDelete.value = null
    }
  }
}
</script>
