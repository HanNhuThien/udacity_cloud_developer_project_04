import {
    PutObjectCommand,
    GetObjectCommand,
    S3Client
  } from '@aws-sdk/client-s3'
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

export async function getUploadUrl(todoId) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })
    return url
  }
  
  export async function getObjectUrl(todoId) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })
    return url
  }