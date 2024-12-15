import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'
import { getUploadUrl, getObjectUrl } from '../../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { dbUpdateAttachmentTodo } from '../../dataLayer/todosAccess.mjs'

const dynamoDbClient = new DynamoDBClient();
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);

const todosTable = process.env.TODOS_TABLE

const logger = createLogger('generateUploadUrl')

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const uploadUrl = await getUploadUrl(todoId)
  const objectUrl = await getObjectUrl(todoId)

  const updatedTodo = await dbUpdateAttachmentTodo(userId, todoId, objectUrl)

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




