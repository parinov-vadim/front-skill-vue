export interface User {
  id: string
  username: string
  email: string
  avatar_url: string | null
  role: string
  xp: number
  streak_days: number
  created_at: string
}

export interface UserProfile {
  username: string
  avatarUrl: string | null
  role: string
  xp: number
  streakDays: number
  lastActive: string | null
  createdAt: string
  stats: {
    solved: number
    attempted: number
    totalSubmissions: number
  }
  categoryProgress: {
    category: string
    solved: number
    total: number
  }[]
  recentActivity: {
    taskSlug: string
    taskTitle: string
    difficulty: string
    status: 'passed' | 'failed'
    date: string
  }[]
}

export interface LoginResponse {
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}
