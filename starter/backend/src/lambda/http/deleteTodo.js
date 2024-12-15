import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../../utils/logger.mjs'

const dynamoDbClient = new DynamoDBClient();
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);
const logger = createLogger('deleteTodo')

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  await dynamoDBDocument.delete({
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId
    }
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      todoId
    })
  }
}
