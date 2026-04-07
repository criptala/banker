import { db } from '../../../shared/infrastructure/db/client.js'
import { Queues } from '../../../shared/infrastructure/queues/QueueRegistry.js'
import crypto from 'crypto'

interface JobData { accountId: string }

export class PollPendingOrdersUseCase {
  async execute({ accountId }: JobData): Promise<void> {
    const { rows } = await db.query(
      `SELECT * FROM account_config WHERE account_id = $1`,
      [accountId]
    )
    if (!rows[0]) throw new Error(`No config for account ${accountId}`)

    const config = rows[0]

    // Build auth header
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (config.auth_type === 'api_key') {
      headers['Api-Key'] = config.auth_token ?? ''
    } else {
      headers['Authorization'] = `Bearer ${config.auth_token ?? ''}`
    }

    // Fetch orders
    const isPost = config.polling_method === 'POST'
    const response = await fetch(config.pending_orders_endpoint, {
      method: config.polling_method,
      headers,
      body: isPost ? JSON.stringify(config.polling_body ?? {}) : undefined,
    })

    if (!response.ok) throw new Error(`Polling failed: ${response.status}`)

    const orders: any[] = await response.json()

    for (const order of orders) {
      if (!order.external_id || order.amount == null || !order.currency || !order.sender_name) {
        console.warn(`[PollPendingOrders] Skipping order missing required fields (external_id, amount, currency, sender_name):`, order)
        continue
      }

      const exists = await db.query(
        'SELECT 1 FROM conciliation_requests WHERE account_id = $1 AND external_id = $2',
        [accountId, String(order.external_id)]
      )
      if (exists.rows.length > 0) continue

      const requestId = crypto.randomUUID()
      await db.query(
        `INSERT INTO conciliation_requests
           (id, account_id, external_id, expected_amount, currency, sender_name, status, retry_count, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,'pending',0,now())`,
        [
          requestId, accountId, String(order.external_id),
          order.amount, order.currency, order.sender_name ?? null,
        ]
      )

      // Encolar conciliación inmediatamente — las transacciones pueden ya estar en la DB
      await Queues.conciliation.add(
        'run',
        { requestId },
        { jobId: `conciliation_${requestId}`, removeOnComplete: true }
      )
    }
  }
}
