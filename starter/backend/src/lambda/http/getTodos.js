import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'
import { dbGetTodos } from '../../dataLayer/todosAccess.mjs'

const logger = createLogger('getTodos')

export async function handler(event) {

  logger.info('Processing event: ', {event})

  const userId = getUserId(event)

  const result = await dbGetTodos(userId)
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