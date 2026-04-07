import { Router } from 'express'
import { db } from '../../shared/infrastructure/db/client.js'
import { AccountRepository } from '../../contexts/account/infrastructure/AccountRepository.js'
import { CreateAccountUseCase } from '../../contexts/account/application/CreateAccountUseCase.js'

export const accountsRouter = Router()
const repo = new AccountRepository()

// Listar cuentas
accountsRouter.get('/', async (_req, res) => {
  const accounts = await repo.findAll()
  res.json(accounts.map(a => ({ id: a.id, bank: a.bank, name: a.name, status: a.status })))
})

// Crear cuenta — body: { bankId: string, name: string }
accountsRouter.post('/', async (req, res) => {
  const { bankId, name } = req.body
  if (!bankId || !name) {
    res.status(400).json({ error: 'bankId and name are required' })
    return
  }
  const useCase = new CreateAccountUseCase(repo)
  const result = await useCase.execute({ bankId, name })
  res.status(201).json(result)
})

// Obtener config de una cuenta
accountsRouter.get('/:accountId/config', async (req, res) => {
  const { rows: [config] } = await db.query(
    `SELECT ac.*, bc.username AS bank_username
       FROM account_config ac
       LEFT JOIN bank_credentials bc ON bc.account_id = ac.account_id AND bc.status = 'valid'
      WHERE ac.account_id = $1`,
    [req.params.accountId]
  )
  res.json(config ?? null)
})

// Disparar scrape manual
accountsRouter.post('/:accountId/scrape', async (req, res) => {
  const { Queues } = await import('../../shared/infrastructure/queues/QueueRegistry.js')
  await Queues.bankScrape.add('scrape', { accountId: req.params.accountId })
  res.status(202).json({ queued: true })
})

// Crear o actualizar config de una cuenta
accountsRouter.put('/:accountId/config', async (req, res) => {
  const { accountId } = req.params
  const {
    pending_orders_endpoint,
    webhook_url,
    polling_interval_seconds,
    retry_limit,
    polling_method,
    polling_body,
    auth_type,
    auth_token,
    bank_username,
    bank_password,
  } = req.body

  if (!pending_orders_endpoint || !webhook_url) {
    res.status(400).json({ error: 'pending_orders_endpoint and webhook_url are required' })
    return
  }

  const { rows: [config] } = await db.query(
    `INSERT INTO account_config
       (id, account_id, pending_orders_endpoint, webhook_url, polling_interval_seconds,
        retry_limit, polling_method, polling_body, auth_type, auth_token)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (account_id) DO UPDATE SET
       pending_orders_endpoint = $2,
       webhook_url             = $3,
       polling_interval_seconds = $4,
       retry_limit             = $5,
       polling_method          = $6,
       polling_body            = $7,
       auth_type               = $8,
       auth_token              = $9,
       updated_at              = now()
     RETURNING *`,
    [
      accountId, pending_orders_endpoint, webhook_url,
      polling_interval_seconds ?? 60, retry_limit ?? 3,
      polling_method ?? 'GET', polling_body ?? null,
      auth_type ?? 'bearer', auth_token ?? null,
    ]
  )

  if (bank_username && bank_password) {
    await db.query(
      `INSERT INTO bank_credentials (id, account_id, username, encrypted_password, status)
       VALUES (gen_random_uuid(), $1, $2, $3, 'valid')
       ON CONFLICT (account_id) DO UPDATE SET
         username           = $2,
         encrypted_password = $3,
         status             = 'valid',
         last_validated_at  = now()`,
      [accountId, bank_username, bank_password]
    )
  }

  res.json(config)
})
