import { Queue, Worker, Job } from 'bullmq'
import { getRedis } from './redis'

const connection = process.env.REDIS_URL
  ? { host: new URL(process.env.REDIS_URL).hostname, port: parseInt(new URL(process.env.REDIS_URL).port || '6379') }
  : undefined

// Order processing queue
export const orderQueue = connection
  ? new Queue('order-processing', { connection })
  : null

// Email queue
export const emailQueue = connection
  ? new Queue('email-sending', { connection })
  : null

// Notification queue
export const notificationQueue = connection
  ? new Queue('notifications', { connection })
  : null

// Add job to order queue
export async function addOrderJob(
  jobName: string,
  data: Record<string, unknown>
): Promise<Job | null> {
  if (!orderQueue) {
    console.warn('Order queue not available (Redis not configured)')
    return null
  }
  return await orderQueue.add(jobName, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  })
}

// Add job to email queue
export async function addEmailJob(
  data: { to: string; subject: string; html: string; text?: string }
): Promise<Job | null> {
  if (!emailQueue) {
    console.warn('Email queue not available (Redis not configured)')
    return null
  }
  return await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })
}

// Add job to notification queue
export async function addNotificationJob(
  data: { userId: string; title: string; message: string; type: string }
): Promise<Job | null> {
  if (!notificationQueue) {
    console.warn('Notification queue not available (Redis not configured)')
    return null
  }
  return await notificationQueue.add('send-notification', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 1000 },
  })
}

// Initialize workers (call this in a separate worker process)
export function initializeWorkers(): void {
  if (!connection) {
    console.warn('Cannot initialize workers: Redis not configured')
    return
  }

  // Order processing worker
  new Worker(
    'order-processing',
    async (job: Job) => {
      console.log(`Processing order job: ${job.name}`, job.data)
      // Process order based on job name
      switch (job.name) {
        case 'process-order':
          // Handle order processing
          break
        case 'update-status':
          // Handle status update
          break
        default:
          console.warn(`Unknown job name: ${job.name}`)
      }
    },
    { connection }
  )

  // Email worker
  new Worker(
    'email-sending',
    async (job: Job) => {
      const { sendEmail } = await import('./email')
      await sendEmail(job.data)
    },
    { connection }
  )

  // Notification worker
  new Worker(
    'notifications',
    async (job: Job) => {
      console.log(`Sending notification:`, job.data)
      // Handle notification sending (push, in-app, etc.)
    },
    { connection }
  )
}
