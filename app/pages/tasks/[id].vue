<script setup lang="ts">
definePageMeta({ layout: 'task' })

const route = useRoute()
const taskId = Number(route.params.id)

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

interface TestCase {
  id: number
  input: string
  expectedOutput: string
  explanation?: string
}

interface TaskDetail {
  id: number
  title: string
  difficulty: Difficulty
  categories: string[]
  tags: string[]
  acceptance: number
  solutions: number
  description: string
  requirements: string[]
  details: string
  constraints: string[]
  examples: TestCase[]
  starterCode: string
  language: string
}

// ─── Definitions ─────────────────────────────────────────────────────────────

const categoryDefs: Record<string, { label: string; style: { color: string; background: string } }> = {
  css:   { label: 'CSS',        style: { color: 'var(--tag-css)',   background: 'var(--tag-css-bg)' } },
  js:    { label: 'JavaScript', style: { color: 'var(--tag-js)',    background: 'var(--tag-js-bg)' } },
  ts:    { label: 'TypeScript', style: { color: 'var(--tag-ts)',    background: 'var(--tag-ts-bg)' } },
  vue:   { label: 'Vue',        style: { color: 'var(--tag-vue)',   background: 'var(--tag-vue-bg)' } },
  react: { label: 'React',      style: { color: 'var(--tag-react)', background: 'var(--tag-react-bg)' } },
  html:  { label: 'HTML',       style: { color: 'var(--tag-html)',  background: 'var(--tag-html-bg)' } },
  svg:   { label: 'SVG',        style: { color: 'var(--tag-svg)',   background: 'var(--tag-svg-bg)' } },
  a11y:  { label: 'A11y',       style: { color: 'var(--tag-a11y)',  background: 'var(--tag-a11y-bg)' } },
}

const difficultyDefs: Record<Difficulty, { label: string; cls: string }> = {
  easy:   { label: 'Легко',   cls: 'badge-easy' },
  medium: { label: 'Средне',  cls: 'badge-medium' },
  hard:   { label: 'Сложно',  cls: 'badge-hard' },
  expert: { label: 'Эксперт', cls: 'badge-expert' },
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const tasksDb: Record<number, TaskDetail> = {
  1: {
    id: 1,
    title: 'Центрирование элемента',
    difficulty: 'easy',
    categories: ['css'],
    tags: ['Flexbox', 'Grid', 'Positioning'],
    acceptance: 81,
    solutions: 9320,
    description: 'Расположите элемент .child точно по центру родительского контейнера .parent тремя разными способами.',
    requirements: [
      'Flexbox — используйте свойства Flexbox для центрирования',
      'Grid — используйте CSS Grid для центрирования',
      'Абсолютное позиционирование — используйте position и transform',
    ],
    details: 'Родительский контейнер имеет фиксированные размеры 300\u00d7200px и видимую границу. Дочерний элемент — 100\u00d7100px с фоновым цветом.',
    constraints: [
      'Используйте только CSS (без JavaScript)',
      'Каждый способ должен работать независимо',
      'Элемент должен быть центрирован и вертикально, и горизонтально',
      'Решение должно работать при изменении размера контейнера',
    ],
    examples: [
      {
        id: 1,
        input: '.parent-flex { width: 300px; height: 200px; }\n.child { width: 100px; height: 100px; }',
        expectedOutput: 'Дочерний элемент центрирован с помощью Flexbox',
        explanation: 'Используйте display: flex, justify-content: center и align-items: center на родителе.',
      },
      {
        id: 2,
        input: '.parent-grid { width: 300px; height: 200px; }\n.child { width: 100px; height: 100px; }',
        expectedOutput: 'Дочерний элемент центрирован с помощью Grid',
        explanation: 'Используйте display: grid и place-items: center на родителе.',
      },
      {
        id: 3,
        input: '.parent-abs { width: 300px; height: 200px; position: relative; }\n.child { width: 100px; height: 100px; }',
        expectedOutput: 'Дочерний элемент центрирован абсолютным позиционированием',
        explanation: 'Используйте position: absolute, top: 50%, left: 50% и transform: translate(-50%, -50%) на дочернем элементе.',
      },
    ],
    starterCode: `/* Способ 1: Flexbox */
.parent-flex {

}

/* Способ 2: Grid */
.parent-grid {

}

/* Способ 3: Absolute positioning */
.parent-abs {
  position: relative;
}
.child-abs {

}`,
    language: 'css',
  },
}

const task = tasksDb[taskId]

useHead({ title: task ? `${task.title} — FrontSkill` : 'Задача не найдена — FrontSkill' })

// ─── State ───────────────────────────────────────────────────────────────────

const code = ref(task?.starterCode ?? '')
const selectedLanguage = ref(task?.language ?? 'css')
const mobileTab = ref<'task' | 'code' | 'tests'>('task')
const bottomTab = ref<'cases' | 'result'>('cases')
const testResult = ref<null | { passed: boolean; details: string[] }>(null)
const isRunning = ref(false)

const languages = [
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
]

function resetCode() {
  code.value = task?.starterCode ?? ''
  testResult.value = null
}

async function runTests() {
  isRunning.value = true
  testResult.value = null

  await new Promise(resolve => setTimeout(resolve, 1000))

  const hasContent = code.value.trim() !== (task?.starterCode ?? '').trim()

  if (hasContent) {
    testResult.value = {
      passed: false,
      details: [
        '\u2713 Тест 1: Flexbox центрирование — пройден',
        '\u2717 Тест 2: Grid центрирование — ожидалось place-items: center',
        '\u2717 Тест 3: Абсолютное позиционирование — элемент не центрирован',
      ],
    }
  }
  else {
    testResult.value = {
      passed: false,
      details: [
        '\u2717 Тест 1: Flexbox — стили не применены',
        '\u2717 Тест 2: Grid — стили не применены',
        '\u2717 Тест 3: Абсолютное позиционирование — стили не применены',
      ],
    }
  }

  bottomTab.value = 'result'
  isRunning.value = false
}

async function submitSolution() {
  isRunning.value = true
  testResult.value = null

  await new Promise(resolve => setTimeout(resolve, 1500))

  testResult.value = {
    passed: true,
    details: [
      '\u2713 Тест 1: Flexbox центрирование — пройден',
      '\u2713 Тест 2: Grid центрирование — пройден',
      '\u2713 Тест 3: Абсолютное позиционирование — пройден',
      '\u2713 Все скрытые тесты пройдены (5/5)',
    ],
  }

  bottomTab.value = 'result'
  isRunning.value = false
}
</script>

<template>
  <!-- Not found -->
  <div v-if="!task" class="flex flex-col items-center justify-center h-full text-center p-8">
    <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
      <UIcon name="i-lucide-file-question" class="size-7 text-zinc-400" />
    </div>
    <p class="font-semibold mb-1">Задача не найдена</p>
    <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-5">Задачи с ID {{ taskId }} не существует</p>
    <UButton to="/tasks" label="К списку задач" variant="outline" color="neutral" />
  </div>

  <!-- Task page -->
  <div v-else class="h-full flex flex-col overflow-hidden">

    <!-- ── Mobile tab bar ── -->
    <div class="md:hidden flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
      <button
        v-for="tab in ([
          { key: 'task', label: 'Задача', icon: 'i-lucide-file-text' },
          { key: 'code', label: 'Код', icon: 'i-lucide-code' },
          { key: 'tests', label: 'Тесты', icon: 'i-lucide-flask-conical' },
        ] as const)"
        :key="tab.key"
        class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors"
        :class="mobileTab === tab.key
          ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 font-medium'
          : 'text-zinc-500 dark:text-zinc-400'"
        @click="mobileTab = tab.key"
      >
        <UIcon :name="tab.icon" class="size-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Content area ── -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">

      <!-- LEFT PANEL: Description -->
      <div
        :class="[
          'w-full md:w-2/5 overflow-y-auto md:border-r border-zinc-200 dark:border-zinc-800',
          mobileTab === 'task' ? '' : 'hidden md:block',
        ]"
      >
        <div class="p-5 sm:p-6">
          <!-- Title + difficulty -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <h1 class="text-lg font-bold leading-tight">
              {{ task.id }}. {{ task.title }}
            </h1>
            <span
              class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="difficultyDefs[task.difficulty].cls"
            >
              {{ difficultyDefs[task.difficulty].label }}
            </span>
          </div>

          <!-- Categories + tags -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            <span
              v-for="catId in task.categories"
              :key="catId"
              class="px-2 py-0.5 rounded text-xs font-medium"
              :style="categoryDefs[catId]?.style"
            >
              {{ categoryDefs[catId]?.label }}
            </span>
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="px-2 py-0.5 rounded text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Description -->
          <div class="mb-5">
            <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
              {{ task.description }}
            </p>
            <p class="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
              Каждый способ должен быть реализован независимо в своём контейнере:
            </p>
            <ol class="list-decimal list-inside space-y-1 mb-3">
              <li
                v-for="(req, i) in task.requirements"
                :key="i"
                class="text-sm text-zinc-600 dark:text-zinc-300"
              >
                {{ req }}
              </li>
            </ol>
            <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {{ task.details }}
            </p>
          </div>

          <!-- Examples -->
          <div class="mb-5">
            <h3 class="text-sm font-semibold mb-3">Примеры</h3>
            <div class="space-y-3">
              <div
                v-for="example in task.examples"
                :key="example.id"
                class="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <div class="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Пример {{ example.id }}
                </div>
                <div class="p-4 space-y-2 text-sm">
                  <div>
                    <span class="font-medium text-zinc-500 dark:text-zinc-400">Вход:</span>
                    <pre class="mt-1 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-xs font-mono overflow-x-auto">{{ example.input }}</pre>
                  </div>
                  <div>
                    <span class="font-medium text-zinc-500 dark:text-zinc-400">Ожидаемый результат:</span>
                    <p class="mt-1">{{ example.expectedOutput }}</p>
                  </div>
                  <div v-if="example.explanation" class="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span class="font-medium text-zinc-500 dark:text-zinc-400">Подсказка:</span>
                    <p class="mt-1 text-zinc-600 dark:text-zinc-300">{{ example.explanation }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Constraints -->
          <div class="mb-5">
            <h3 class="text-sm font-semibold mb-3">Ограничения</h3>
            <ul class="space-y-1.5">
              <li
                v-for="(constraint, i) in task.constraints"
                :key="i"
                class="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300"
              >
                <UIcon name="i-lucide-alert-circle" class="size-4 text-zinc-400 mt-0.5 shrink-0" />
                {{ constraint }}
              </li>
            </ul>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-bar-chart-3" class="size-4" />
              {{ task.acceptance }}% принято
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-users" class="size-4" />
              {{ task.solutions.toLocaleString('ru') }} решений
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Editor + Tests + Actions -->
      <div
        :class="[
          'w-full md:w-3/5 flex-col overflow-hidden',
          mobileTab !== 'task' ? 'flex' : 'hidden md:flex',
        ]"
      >
        <!-- Editor section -->
        <div
          :class="[
            'flex-col overflow-hidden',
            mobileTab === 'tests' ? 'hidden md:flex md:flex-[2]' : 'flex flex-[2]',
          ]"
        >
          <!-- Toolbar -->
          <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-900">
            <USelect
              v-model="selectedLanguage"
              :items="languages"
              value-key="value"
              label-key="label"
              size="xs"
              class="w-36"
            />
            <UButton
              label="Сбросить"
              icon="i-lucide-rotate-ccw"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="resetCode"
            />
          </div>

          <!-- Code editor -->
          <div class="flex-1 overflow-hidden">
            <ClientOnly>
              <CodeEditor
                v-model="code"
                :language="selectedLanguage"
                class="h-full"
              />
              <template #fallback>
                <div class="h-full editor-surface flex items-center justify-center">
                  <span class="text-zinc-500 text-sm">Загрузка редактора...</span>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Tests section -->
        <div
          :class="[
            'flex-col overflow-hidden border-t border-zinc-200 dark:border-zinc-800',
            mobileTab === 'tests' ? 'flex flex-1' : mobileTab === 'code' ? 'hidden md:flex md:flex-1' : 'hidden md:flex md:flex-1',
          ]"
        >
          <!-- Bottom tabs -->
          <div class="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-900">
            <button
              class="px-4 py-2 text-xs font-medium transition-colors"
              :class="bottomTab === 'cases'
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'"
              @click="bottomTab = 'cases'"
            >
              Тест-кейсы
            </button>
            <button
              class="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
              :class="bottomTab === 'result'
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'"
              @click="bottomTab = 'result'"
            >
              Результат
              <span
                v-if="testResult"
                class="w-2 h-2 rounded-full"
                :class="testResult.passed ? 'bg-green-500' : 'bg-red-500'"
              />
            </button>
          </div>

          <!-- Tab content -->
          <div class="flex-1 overflow-y-auto p-3">
            <!-- Test cases -->
            <div v-if="bottomTab === 'cases'" class="space-y-3">
              <div
                v-for="example in task.examples"
                :key="example.id"
                class="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-sm"
              >
                <div class="text-xs font-medium text-zinc-400 mb-2">Тест {{ example.id }}</div>
                <div class="space-y-1.5">
                  <div>
                    <span class="text-xs text-zinc-500">Input:</span>
                    <pre class="text-xs font-mono mt-0.5 whitespace-pre-wrap">{{ example.input }}</pre>
                  </div>
                  <div>
                    <span class="text-xs text-zinc-500">Expected:</span>
                    <p class="text-xs mt-0.5">{{ example.expectedOutput }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Results -->
            <div v-else-if="bottomTab === 'result'">
              <div v-if="!testResult" class="flex flex-col items-center justify-center py-8 text-center">
                <UIcon name="i-lucide-play" class="size-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                <p class="text-sm text-zinc-400">Запустите тесты, чтобы увидеть результат</p>
              </div>
              <div v-else>
                <div
                  class="mb-3 px-3 py-2 rounded-lg text-sm font-medium"
                  :class="testResult.passed
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'"
                >
                  {{ testResult.passed ? 'Все тесты пройдены!' : 'Некоторые тесты не пройдены' }}
                </div>
                <div class="space-y-1">
                  <p
                    v-for="(detail, i) in testResult.details"
                    :key="i"
                    class="text-sm font-mono"
                    :class="detail.startsWith('\u2713')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'"
                  >
                    {{ detail }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action bar -->
        <div
          :class="[
            'items-center justify-between gap-2 px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0',
            mobileTab === 'task' ? 'hidden md:flex' : 'flex',
          ]"
        >
          <NuxtLink
            to="/tasks"
            class="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            К списку
          </NuxtLink>
          <div class="flex items-center gap-2">
            <UButton
              label="Запустить"
              icon="i-lucide-play"
              variant="outline"
              color="neutral"
              size="sm"
              :loading="isRunning"
              @click="runTests"
            />
            <UButton
              label="Отправить"
              icon="i-lucide-send"
              color="primary"
              size="sm"
              :loading="isRunning"
              @click="submitSolution"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
