import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function handler(event) {
  console.log('Processing event: ', event)
  
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const parsedBody = JSON.parse(event.body)
  const uploadUrl = await getUploadUrl(todoId)

  const params = {
    TableName: todosTable,
    Key:{ userId: userId, todoId: todoId },
    UpdateExpression: "SET #attachmentUrl = :attachmentUrl",
    ExpressionAttributeNames: {
      "#attachmentUrl": "attachmentUrl"
    },
    ExpressionAttributeValues: {
      ":attachmentUrl": uploadUrl
    },
    ReturnValues: "ALL_NEW",
  }

  const updatedTodo = await dynamoDbDocument.update(params)
  
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
