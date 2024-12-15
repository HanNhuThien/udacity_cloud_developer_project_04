import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { dbUpdateCheckTodo } from '../../dataLayer/todosAccess.mjs'

const logger = createLogger('updateTodo')

const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const parsedBody = JSON.parse(event.body)

  const updatedTodo = await dbUpdateCheckTodo(userId, todoId, parsedBody)

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
