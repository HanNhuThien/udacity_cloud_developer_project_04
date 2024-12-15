import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

  const parsedBody = JSON.parse(event.body)

  const userId = getUserId(event)

  const todoId = uuidv4()

  const newItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toLocaleTimeString(),
    done: false,
    ...parsedBody
  }

  await dynamoDbDocument.put({
    TableName: todosTable,
    Item: newItem
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item : newItem
    })
  }
}