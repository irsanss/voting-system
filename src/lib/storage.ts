import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface COSConfig {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucketName: string
}

class CloudObjectStorage {
  private client: S3Client
  private config: COSConfig

  constructor() {
    this.config = {
      endpoint: process.env.IBM_COS_ENDPOINT || '',
      accessKeyId: process.env.IBM_COS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.IBM_COS_SECRET_ACCESS_KEY || '',
      region: process.env.IBM_COS_REGION || '',
      bucketName: process.env.IBM_COS_BUCKET_NAME || ''
    }

    if (!this.config.endpoint || !this.config.accessKeyId || !this.config.secretAccessKey) {
      console.warn('IBM Cloud Object Storage not configured. File uploads will be disabled.')
      this.client = null as any
      return
    }

    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      forcePathStyle: true // Required for IBM COS
    })
  }

  private isConfigured(): boolean {
    return this.client !== null && this.config.bucketName !== ''
  }

  async uploadFile(key: string, body: Buffer | string, contentType: string = 'application/octet-stream'): Promise<string | null> {
    if (!this.isConfigured()) {
      console.error('COS not configured')
      return null
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType
      })

      await this.client.send(command)
      
      // Return public URL if bucket is public, or generate presigned URL
      return `${this.config.endpoint}/${this.config.bucketName}/${key}`
    } catch (error) {
      console.error('Failed to upload file to COS:', error)
      return null
    }
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    if (!this.isConfigured()) {
      console.error('COS not configured')
      return null
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      })

      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error) {
      console.error('Failed to generate presigned URL:', error)
      return null
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('COS not configured')
      return false
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      })

      await this.client.send(command)
      return true
    } catch (error) {
      console.error('Failed to delete file from COS:', error)
      return false
    }
  }

  async listFiles(prefix: string = ''): Promise<string[]> {
    if (!this.isConfigured()) {
      console.error('COS not configured')
      return []
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: prefix
      })

      const response = await this.client.send(command)
      return response.Contents?.map(obj => obj.Key || '') || []
    } catch (error) {
      console.error('Failed to list files from COS:', error)
      return []
    }
  }

  // Upload candidate image
  async uploadCandidateImage(candidateId: string, imageBuffer: Buffer, fileName: string): Promise<string | null> {
    const key = `candidates/${candidateId}/images/${Date.now()}-${fileName}`
    return this.uploadFile(key, imageBuffer, 'image/jpeg')
  }

  // Upload candidate document (PDF, etc.)
  async uploadCandidateDocument(candidateId: string, documentBuffer: Buffer, fileName: string): Promise<string | null> {
    const key = `candidates/${candidateId}/documents/${Date.now()}-${fileName}`
    return this.uploadFile(key, documentBuffer, 'application/pdf')
  }

  // Upload audit report
  async uploadAuditReport(reportId: string, reportBuffer: Buffer, fileName: string): Promise<string | null> {
    const key = `reports/audit/${reportId}/${Date.now()}-${fileName}`
    return this.uploadFile(key, reportBuffer, 'application/pdf')
  }

  // Upload voting data backup
  async uploadVotingBackup(projectId: string, backupData: string): Promise<string | null> {
    const key = `backups/voting/${projectId}/${Date.now()}-backup.json`
    return this.uploadFile(key, backupData, 'application/json')
  }
}

export const cos = new CloudObjectStorage()
export default cos