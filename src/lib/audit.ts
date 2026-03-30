import prisma from '@/lib/prisma'

interface AuditLogParams {
  adminId: string
  action: string
  entityType: string
  entityId: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  ipAddress?: string | null
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData ? JSON.stringify(params.oldData) : null,
        newData: params.newData ? JSON.stringify(params.newData) : null,
        ipAddress: params.ipAddress || null,
      },
    })
  } catch (error) {
    console.error('Audit log creation error:', error)
  }
}

export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message: string
  relatedEntityId?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedEntityId: params.relatedEntityId || null,
      },
    })
  } catch (error) {
    console.error('Notification creation error:', error)
  }
}
