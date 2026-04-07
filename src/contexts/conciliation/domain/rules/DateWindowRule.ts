import { CandidateTransaction, RequestData } from '../ConciliationEngine.js'

export function applyDateWindowRule(request: RequestData, candidates: CandidateTransaction[], windowDays = 3): CandidateTransaction[] {
  const from = new Date(request.createdAt)
  from.setDate(from.getDate() - windowDays)
  return candidates.filter(t => t.receivedAt >= from)
}
