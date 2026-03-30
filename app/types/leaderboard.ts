export interface LeaderboardEntry {
  id: number
  rank: number
  username: string
  avatarUrl: string | null
  xp: number
  streakDays: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  total: number
  page: number
  limit: number
}
