import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: !!process.env.S3_ENDPOINT, // Required for MinIO/DigitalOcean Spaces
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'mansah-uploads'

export async function uploadFile(
  file: Buffer,
  originalName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  const extension = originalName.split('.').pop() || 'bin'
  const key = `${folder}/${uuidv4()}.${extension}`

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )

  // Return the public URL
  const baseUrl = process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`
  return `${baseUrl}/${key}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const baseUrl = process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`
  const key = fileUrl.replace(`${baseUrl}/`, '')

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  )
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const extension = fileName.split('.').pop() || 'bin'
  const key = `${folder}/${uuidv4()}.${extension}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  const baseUrl = process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`
  const fileUrl = `${baseUrl}/${key}`

  return { uploadUrl, fileUrl }
}

export { s3Client, BUCKET_NAME }
