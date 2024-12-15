import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { dbDeleteTodo } from '../../dataLayer/todosAccess.mjs'

const logger = createLogger('deleteTodo')

export async function handler(event) {
  logger.info('Processing event: ', {event})

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  await dbDeleteTodo(userId, todoId)

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
