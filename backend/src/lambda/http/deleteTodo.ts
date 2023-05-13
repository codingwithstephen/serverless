import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodoItem } from '../../helpers/todos'
import { getUserId } from '../utils'
import middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')



export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)
    logger.info(event.pathParameters);
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    await deleteTodoItem(userId, todoId)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)

