import { Worker } from 'bullmq'
import { redis } from '../QueueRegistry.js'

export const orderIngestionWorker = new Worker(
  'order-ingestion',
  async job => {
    console.log(`[order-ingestion] starting job ${job.id}`, job.data)
    try {
      const mod = await import('../../../../contexts/conciliation/application/PollPendingOrdersUseCase.js')
      await new mod.PollPendingOrdersUseCase().execute(job.data)
      console.log(`[order-ingestion] job ${job.id} completed`)
    } catch (err) {
      console.error(`[order-ingestion] job ${job.id} failed:`, err)
      throw err
    }
  },
  { connection: redis }
)

orderIngestionWorker.on('failed', (job, err) => {
  console.error(`[order-ingestion] worker failed event:`, job?.id, err.message)
})
