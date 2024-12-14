
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)

  await dynamoDbDocument.update({
    TableName: todosTable,
    Item: updatedTodo
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updatedTodo
    })
  }
}