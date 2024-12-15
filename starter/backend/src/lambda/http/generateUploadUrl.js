import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'

import { createLogger } from '../../utils/logger.mjs'

const dynamoDbClient = new DynamoDBClient();
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const logger = createLogger('generateUploadUrl')

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const uploadUrl = await getUploadUrl(todoId)
  const objectUrl = await getObjectUrl(todoId)

  const params = {
    TableName: todosTable,
    Key: { userId: userId, todoId: todoId },
    UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
    ExpressionAttributeNames: {
      '#attachmentUrl': 'attachmentUrl'
    },
    ExpressionAttributeValues: {
      ':attachmentUrl': objectUrl
    },
    ReturnValues: 'ALL_NEW'
  }
  const updatedTodo = await dynamoDBDocument.update(params)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: updatedTodo,
      uploadUrl: uploadUrl
    })
  }
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function getUploadUrl(todoId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: todoId
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}

async function getObjectUrl(todoId) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: todoId
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}
