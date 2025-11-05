<template>
  <div class="relative flex h-screen bg-surface-ground text-text-primary">
    <!-- القائمة الجانبية لسطح المكتب (ثابتة) -->
    <div class="hidden lg:flex lg:flex-shrink-0">
      <TheSidebar class="w-64" />
    </div>

    <!-- القائمة الجانبية للهاتف (منبثقة) -->
    <TransitionRoot as="template" :show="isSidebarOpen">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="isSidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60" />
        </TransitionChild>
        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-auto flex h-full w-full max-w-xs flex-1">
              <TheSidebar class="w-full" @close-sidebar="isSidebarOpen = false" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- المحتوى الرئيسي -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <TheHeader @open-sidebar="isSidebarOpen = true" />
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import TheSidebar from './TheSidebar.vue'
import TheHeader from './TheHeader.vue'

const isSidebarOpen = ref(false)
</script>
