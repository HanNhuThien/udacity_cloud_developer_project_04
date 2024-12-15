import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  console.log('Processing event: ', event)

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

  const updatedTodo = await dynamoDbDocument.update(params)

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
