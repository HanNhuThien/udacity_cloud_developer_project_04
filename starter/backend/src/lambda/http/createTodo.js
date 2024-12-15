import { getUserId } from '../utils.mjs'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '../../utils/logger.mjs'
import { dbCreateTodo } from '../../dataLayer/todosAccess.mjs'
import { isTodoNameInvalid } from '../../businessLogic/todos.mjs'

const logger = createLogger('createTodo')

export async function handler(event) {
  logger.info('Processing event: ', { event })

  const parsedBody = JSON.parse(event.body)
  const isNameInvalid = isTodoNameInvalid(parsedBody.name)

  if (isNameInvalid) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Input todo name'
      })
    }
  }

  const userId = getUserId(event)
  const todoId = uuidv4()
  const newItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toLocaleTimeString(),
    done: false,
    ...parsedBody
  }

  await dbCreateTodo(newItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
