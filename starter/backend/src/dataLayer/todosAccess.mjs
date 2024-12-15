
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

const dynamoDbClient = new DynamoDBClient()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDbClient)
const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay)

const todosTable = process.env.TODOS_TABLE

export async function dbGetTodos(userId){
    const queryCommand = {
        TableName: todosTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };
        return dynamoDBDocument.query(queryCommand)
}

export async function dbCreateTodo(newItem){
    return dynamoDBDocument.put({
        TableName: todosTable,
        Item: newItem
      })
}

export async function dbDeleteTodo(userId, todoId){
    return dynamoDBDocument.delete({
        TableName: todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
}

export async function dbUpdateAttachmentTodo(userId, todoId, attachmentUrl){
    const params = {
        TableName: todosTable,
        Key: { userId: userId, todoId: todoId },
        UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        },
        ReturnValues: 'ALL_NEW'
      }
    return dynamoDBDocument.update(params)
}

export async function dbUpdateCheckTodo(userId, todoId, parsedBody){
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
    return dynamoDBDocument.update(params)
}