import { Queues } from './QueueRegistry.js'
import { db } from '../db/client.js'

export class Scheduler {
  private timers: NodeJS.Timeout[] = []

  async start(): Promise<void> {
    const pollingInterval = Number(process.env.POLLING_INTERVAL_SECONDS ?? 60) * 1000
    const scrapeInterval  = Number(process.env.SCRAPE_INTERVAL_SECONDS ?? 3600) * 1000

    // Arranca inmediatamente y luego en loop
    await this.enqueuePolling()
    await this.enqueueScraping()

    this.timers.push(
      setInterval(() => this.enqueuePolling(),  pollingInterval),
      setInterval(() => this.enqueueScraping(), scrapeInterval),
    )

    console.log(`Scheduler started — polling every ${pollingInterval / 1000}s, scraping every ${scrapeInterval / 1000}s`)
  }

  stop(): void {
    this.timers.forEach(t => clearInterval(t))
    this.timers = []
    console.log('Scheduler stopped')
  }

  private async enqueuePolling(): Promise<void> {
    const { rows: accounts } = await db.query(
      `SELECT id FROM accounts WHERE status = 'active'`
    )

    for (const account of accounts) {
      await Queues.orderIngestion.add(
        'poll',
        { accountId: account.id },
        {
          jobId: `poll:${account.id}:${Date.now()}`,
          removeOnComplete: true,
          removeOnFail: 100,
        }
      )
    }

    console.log(`[Scheduler] Enqueued polling for ${accounts.length} account(s)`)
  }

  private async enqueueScraping(): Promise<void> {
    const { rows: accounts } = await db.query(
      `SELECT id FROM accounts WHERE status = 'active'`
    )

    for (const account of accounts) {
      // Verificar que no haya un job activo o en espera para esta cuenta
      const active = await Queues.bankScrape.getActive()
      const waiting = await Queues.bankScrape.getWaiting()

      const alreadyRunning = [...active, ...waiting].some(
        j => j.data.accountId === account.id
      )

      if (alreadyRunning) {
        console.log(`[Scheduler] Skipping scrape for ${account.id} — already queued`)
        continue
      }

      await Queues.bankScrape.add(
        'scrape',
        { accountId: account.id },
        { removeOnComplete: true, removeOnFail: 10 }
      )
    }

    console.log(`[Scheduler] Enqueued scraping for ${accounts.length} account(s)`)
  }
}
