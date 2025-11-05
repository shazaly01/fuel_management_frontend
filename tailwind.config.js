/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', ...defaultTheme.fontFamily.sans],
      },
      // [مُعدَّل] تم تغيير الألوان لتعكس ثيم "الشفق القطبي"
      colors: {
        // اللون الأساسي أصبح أخضر زمردي
        primary: '#10B981',
        // اللون الثانوي أصبح أصفر كهرماني
        secondary: '#F59E0B',

        // ألوان الحالات (يمكن أن تبقى كما هي)
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F97316',

        // ألوان الخلفيات (يمكن أن تبقى كما هي أو نعدلها قليلاً)
        'surface-ground': '#111827',
        'surface-section': '#1F2937',
        'surface-border': '#374151',

        // ألوان النصوص (تبقى كما هي)
        'text-primary': '#F9FAFB',
        'text-secondary': '#D1D5DB',
        'text-muted': '#9CA3AF',
      },
    },
  },
  plugins: [],
}
