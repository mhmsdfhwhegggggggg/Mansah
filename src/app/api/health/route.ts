import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getRedis } from '@/lib/redis'

export async function GET() {
  try {
    // Check Database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    const redis = getRedis();
    if (redis) {
      await redis.ping();
    }

    return NextResponse.json({ status: 'ok', message: 'All systems operational' }, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error', message: 'System health check failed' }, { status: 503 })
  }
}
