import { CandidateTransaction, RequestData } from '../ConciliationEngine.js'

export function applyExactAmountRule(request: RequestData, candidates: CandidateTransaction[]): CandidateTransaction[] {
  return candidates.filter(
    t => t.amount === request.expectedAmount && t.currency === request.currency
  )
}
