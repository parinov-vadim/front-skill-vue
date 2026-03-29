export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface Task {
  id: number
  slug: string
  title: string
  description: string
  difficulty: Difficulty
  categories: string[]
  tags: string[]
  solved: boolean
  attempted: boolean
  acceptance: number
  solutions: number
}

export interface TestCase {
  id: number
  input: string
  expectedOutput: string
  explanation?: string
}

export interface TaskDetail {
  id: number
  slug: string
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

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
}
