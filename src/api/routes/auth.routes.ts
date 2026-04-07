import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../../shared/infrastructure/db/client.js'
import crypto from 'crypto'

export const authRouter = Router()

// Register
authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password required' })
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()

  try {
    await db.query(
      `INSERT INTO users (id, email, password_hash, name) VALUES ($1,$2,$3,$4)`,
      [id, email, hash, name ?? null]
    )
    res.status(201).json({ id, email })
  } catch {
    res.status(409).json({ error: 'Email already exists' })
  }
})

// Login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password required' })
    return
  }

  const { rows: [user] } = await db.query(
    `SELECT * FROM users WHERE email = $1 AND status = 'active'`,
    [email]
  )

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})
