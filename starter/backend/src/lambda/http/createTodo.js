import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../../utils/logger.mjs'

const dynamoDbClient = new DynamoDBClient()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient)
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay)
const logger = createLogger('createTodo')
const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  logger.info('Processing event: ', { event })

  const parsedBody = JSON.parse(event.body)

  if (!parsedBody.name || parsedBody.name.trim() === '') {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Input todo name'
      })
    }
  }

  const userId = getUserId(event)

  const todoId = uuidv4()

  const newItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toLocaleTimeString(),
    done: false,
    ...parsedBody
  }

  await dynamoDBDocument.put({
    TableName: todosTable,
    Item: newItem
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
