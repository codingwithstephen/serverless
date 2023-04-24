import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
const AWS = require('aws-sdk');
import * as uuid from 'uuid'

const todoTable = process.env.TODOS_TABLE;

const docClient = new AWS.DynamoDB.DocumentClient();
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // TODO: Implement creating a new TODO item

    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const todo = {
      userId,
        todoId: uuid.v4(),
      done: false,
      createdAt: new Date().toISOString(),
    ...newTodo
    }

    await docClient.put({
      TableName: todoTable,
      Item: {
        ...todo
      }
    }).promise()


    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        todo
      })
    }
  }
);

handler.use(
  cors({
    credentials: true
  })
);
