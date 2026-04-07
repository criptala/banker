import { db } from '../../../shared/infrastructure/db/client.js'
import { IScrapeRunRepository } from '../domain/IScrapeRunRepository.js'

export class ScrapeRunRepository implements IScrapeRunRepository {
  async create(runId: string, accountId: string, scriptId: string): Promise<void> {
    await db.query(
      `INSERT INTO bank_scrape_runs (id, account_id, script_id, status, started_at)
       VALUES ($1,$2,$3,'running',now())`,
      [runId, accountId, scriptId]
    )
  }

  async markSuccess(runId: string, transactionCount: number): Promise<void> {
    await db.query(
      `UPDATE bank_scrape_runs SET status='success', transactions_found=$1, finished_at=now() WHERE id=$2`,
      [transactionCount, runId]
    )
  }

  async markFailed(runId: string, errorMessage: string): Promise<void> {
    await db.query(
      `UPDATE bank_scrape_runs SET status='failed', failure_type='unknown', error_message=$1, finished_at=now() WHERE id=$2`,
      [errorMessage, runId]
    )
  }
}
