// ─── Docs sections configuration ──────────────────────────────────────

export interface DocsSection {
  id: string
  label: string
  icon: string
  description: string
  iconColor: string
  tagColor: string
}

export const DOCS_SECTIONS: DocsSection[] = [
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'i-lucide-code-2',
    description: 'Основы языка, DOM, асинхронность и паттерны',
    iconColor: 'text-yellow-500',
    tagColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  },
  {
    id: 'css',
    label: 'CSS',
    icon: 'i-lucide-palette',
    description: 'Стили, лэйаут, анимации и современный CSS',
    iconColor: 'text-blue-500',
    tagColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'html',
    label: 'HTML',
    icon: 'i-lucide-file-code',
    description: 'Семантика, формы, доступность и мета-теги',
    iconColor: 'text-orange-500',
    tagColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  },
  {
    id: 'vue',
    label: 'Vue',
    icon: 'i-lucide-component',
    description: 'Composition API, директивы, реактивность',
    iconColor: 'text-emerald-500',
    tagColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'react',
    label: 'React',
    icon: 'i-lucide-atom',
    description: 'JSX, хуки, virtual DOM и управление состоянием',
    iconColor: 'text-cyan-500',
    tagColor: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  },
  {
    id: 'angular',
    label: 'Angular',
    icon: 'i-lucide-hexagon',
    description: 'Компоненты, сервисы, модули и RxJS',
    iconColor: 'text-red-500',
    tagColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
  {
    id: 'git',
    label: 'Git',
    icon: 'i-lucide-git-branch',
    description: 'Управление версиями, ветки и рабочий процесс',
    iconColor: 'text-violet-500',
    tagColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    icon: 'i-lucide-shield-check',
    description: 'Типы, дженерики, утилиты и типизация фреймворков',
    iconColor: 'text-blue-600',
    tagColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'tools',
    label: 'Инструменты',
    icon: 'i-lucide-wrench',
    description: 'Сборка, линтинг, DevTools, дизайн и контейнеризация',
    iconColor: 'text-slate-500',
    tagColor: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
  },
  {
    id: 'web-fundamentals',
    label: 'Основы веба',
    icon: 'i-lucide-globe',
    description: 'HTTP, REST, безопасность, производительность и SEO',
    iconColor: 'text-teal-500',
    tagColor: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  },
  {
    id: 'algorithms',
    label: 'Алгоритмы',
    icon: 'i-lucide-brain',
    description: 'Структуры данных, сортировки, графы и динамическое программирование',
    iconColor: 'text-pink-500',
    tagColor: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  },
  {
    id: 'career',
    label: 'Карьера',
    icon: 'i-lucide-briefcase',
    description: 'Дорожная карта, собеседования, резюме и зарплаты',
    iconColor: 'text-amber-500',
    tagColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
]

// ─── Docs nav composable ───────────────────────────────────────────────

export function useDocs() {
  const sectionMap = Object.fromEntries(DOCS_SECTIONS.map(s => [s.id, s]))

  function getSectionMeta(sectionId: string): DocsSection | undefined {
    return sectionMap[sectionId]
  }

  return { DOCS_SECTIONS, getSectionMeta }
}
