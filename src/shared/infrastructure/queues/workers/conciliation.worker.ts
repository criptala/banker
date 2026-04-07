import { Worker } from 'bullmq'
import { redis } from '../QueueRegistry.js'

export const conciliationWorker = new Worker(
  'conciliation',
  async job => {
    const mod = await import('../../../../contexts/conciliation/application/RunConciliationUseCase.js')
    await new mod.RunConciliationUseCase().execute(job.data)
  },
  { connection: redis }
)

conciliationWorker.on('completed', job => {
  console.log(`[conciliation] job ${job.id} completed`)
})

conciliationWorker.on('failed', (job, err) => {
  console.error(`[conciliation] job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message)
})

export const webhookWorker = new Worker(
  'webhook',
  async job => {
    const mod = await import('../../../../contexts/conciliation/application/NotifyWebhookUseCase.js')
    await new mod.NotifyWebhookUseCase().execute(job.data)
  },
  { connection: redis }
)

webhookWorker.on('completed', job => {
  console.log(`[webhook] job ${job.id} completed`)
})

webhookWorker.on('failed', (job, err) => {
  console.error(`[webhook] job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message)
})
