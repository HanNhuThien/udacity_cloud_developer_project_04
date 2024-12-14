import { createLogger } from '../../utils/logger.mjs'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

// const logger = createLogger('getTodos')

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

  const scanCommand = {
    TableName: todosTable
  }
  const result = await dynamoDbClient.scan(scanCommand)
  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}