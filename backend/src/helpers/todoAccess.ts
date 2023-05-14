import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
const logger = createLogger('todoAccess')

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3 = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodoITem(todoId: string, userId: string): Promise<TodoItem>{
    const result = await this.docClient.get({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId
      }
    }).promise();

    const item = result.Item



    return item as TodoItem
  }
  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: {
        ...todoItem
      }
    }).promise()

    return todoItem
  }

  async getSignedUrl(bucketKey: string): Promise<string> {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: bucketKey,
      Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
    });
  }


  async updateAttachmentUrl(userId: string, todoId: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl=:attachmentUrl",
      ExpressionAttributeValues:{
        ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
      }
    }).promise()
  }

  async updateTodoItem(updateTodoRequest, userId, todoId, attachmentUrl) {

    logger.error("Attachment Url");
    logger.error(attachmentUrl);

    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #name=:name, dueDate=:dueDate, done=:done, attachmentUrl=:attachmentUrl",
      ExpressionAttributeValues: {
        ":name": updateTodoRequest.name,
        ":dueDate": updateTodoRequest.dueDate,
        ":done": updateTodoRequest.done,
        ":attachmentUrl": updateTodoRequest.attachmentUrl
      },
      ExpressionAttributeNames: {
        "#name": "name"
      }
    }).promise();
  }


  async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()
  }

  async deleteTodoItemAttachment(bucketKey: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: bucketKey
    }).promise()
  }
}
