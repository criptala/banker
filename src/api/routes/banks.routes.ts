import { Router } from 'express'
import { db } from '../../shared/infrastructure/db/client.js'
import { BankRepository } from '../../contexts/account/infrastructure/BankRepository.js'
import { Bank } from '../../contexts/account/domain/Bank.js'
import crypto from 'crypto'

export const banksRouter = Router()
const repo = new BankRepository()

// List all banks
banksRouter.get('/', async (_req, res) => {
  const banks = await repo.findAll()
  res.json(banks.map(b => ({
    id: b.id,
    code: b.code,
    name: b.name,
    loginUrl: b.loginUrl,
    status: b.status,
  })))
})

// Create a bank
banksRouter.post('/', async (req, res) => {
  const { code, name, loginUrl } = req.body
  if (!code || !name) {
    res.status(400).json({ error: 'code and name are required' })
    return
  }
  const bank = Bank.create(crypto.randomUUID(), code, name, loginUrl)
  await repo.save(bank)
  res.status(201).json({ id: bank.id })
})

// Get a bank with its scripts
banksRouter.get('/:bankId', async (req, res) => {
  const bank = await repo.findById(req.params.bankId)
  if (!bank) {
    res.status(404).json({ error: 'Bank not found' })
    return
  }

  const { rows: scripts } = await db.query(
    `SELECT id, flow_type, version, status, origin, created_at
       FROM bank_scripts
      WHERE bank_id = $1
      ORDER BY created_at DESC`,
    [bank.id]
  )

  res.json({
    id: bank.id,
    code: bank.code,
    name: bank.name,
    loginUrl: bank.loginUrl,
    status: bank.status,
    scripts,
  })
})
