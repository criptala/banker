import { ValueObject } from '../../../shared/domain/ValueObject.js'

export type MatchStatus = 'matched' | 'not_found' | 'ambiguous'

interface MatchResultProps {
  status: MatchStatus
  transactionId?: string
  candidateIds: string[]
}

export class MatchResult extends ValueObject<MatchResultProps> {
  static matched(transactionId: string, candidates: string[]): MatchResult {
    return new MatchResult({ status: 'matched', transactionId, candidateIds: candidates })
  }

  static notFound(): MatchResult {
    return new MatchResult({ status: 'not_found', candidateIds: [] })
  }

  static ambiguous(candidates: string[]): MatchResult {
    return new MatchResult({ status: 'ambiguous', candidateIds: candidates })
  }

  get status()        { return this.props.status }
  get transactionId() { return this.props.transactionId }
  get candidateIds()  { return this.props.candidateIds }
}
