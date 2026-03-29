export type SubmissionStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error' | 'timeout'

export interface SubmissionResult {
  passed: boolean
  details: string[]
  totalTests: number
  passedTests: number
  execTime: number
}

export interface Submission {
  id: string
  status: SubmissionStatus
  result: SubmissionResult | null
}
