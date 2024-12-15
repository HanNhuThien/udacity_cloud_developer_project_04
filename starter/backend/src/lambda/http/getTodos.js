import { createLogger } from '../../utils/logger.mjs'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { getUserId } from '../utils.mjs'
import AWSXRay from 'aws-xray-sdk-core'

const dynamoDbClient = new DynamoDBClient();
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient);
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);

const logger = createLogger('getTodos')

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {

  logger.info('Processing event: ', {event})

  const userId = getUserId(event)

  const queryCommand = {
    TableName: todosTable,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await dynamoDBDocument.query(queryCommand)
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