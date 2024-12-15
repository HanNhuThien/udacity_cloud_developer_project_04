import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../../utils/logger.mjs'

const dynamoDbClient = new DynamoDBClient();
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);
const logger = createLogger('updateTodo')

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const parsedBody = JSON.parse(event.body)
  
  const params = {
    TableName: todosTable,
    Key:{ userId: userId, todoId: todoId },
    UpdateExpression: "SET #name = :name, #done = :done, #dueDate = :dueDate",
    ExpressionAttributeNames: {
      "#name": "name",
      "#done": "done",
      "#dueDate": "dueDate"
    },
    ExpressionAttributeValues: {
      ":name": parsedBody.name,
      ":done": parsedBody.done,
      ":dueDate": parsedBody.dueDate 
    },
    ReturnValues: "ALL_NEW",
  }

  const updatedTodo = await dynamoDBDocument.update(params)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: updatedTodo
    })
  }
}
