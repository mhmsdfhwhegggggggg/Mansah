import { Queue, Worker, Job } from 'bullmq'

function getConnection() {
  if (!process.env.REDIS_URL) return undefined

  try {
    const url = new URL(process.env.REDIS_URL)
    const isUpstash = url.hostname.includes('upstash.io')
    const useTls = process.env.REDIS_URL.startsWith('rediss://') || isUpstash

    return {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
      username: url.username || undefined,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  } catch {
    console.warn('Invalid REDIS_URL, queues disabled')
    return undefined
  }
}

const connection = getConnection()

// Order processing queue
let orderQueue: Queue | null = null
let emailQueue: Queue | null = null
let notificationQueue: Queue | null = null

try {
  if (connection) {
    orderQueue = new Queue('order-processing', { connection })
    emailQueue = new Queue('email-sending', { connection })
    notificationQueue = new Queue('notifications', { connection })
  }
} catch (error) {
  console.warn('Failed to initialize BullMQ queues:', error)
}

export { orderQueue, emailQueue, notificationQueue }

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
