import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from './todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()
import { createLogger } from '../utils/logger'
const logger = createLogger('todos')


export async function getAllTodos(userId: string): Promise<TodoItem[]> {

  return await todoAccess.getAllTodos(userId)
}

export async function createTodoItem(
  createGroupRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  return await todoAccess.createTodoItem({
    userId,
    todoId: uuid.v4(),
    done: false,
    createdAt: new Date().toISOString(),
    ...createGroupRequest
  })
}

export async function getTodoItem(todoId: string, userId: string): Promise<TodoItem>{
  return await todoAccess.getTodoITem(todoId, userId);

}

export async function updateAttachment(userId: string, todoId: string): Promise<string> {
  const uploadUrl = await todoAccess.getSignedUrl(todoId)
  logger.info("Upload Url")
  logger.info(uploadUrl);
  logger.info(userId);
  logger.info(todoId);
  logger.info("Before update attachment url");
  await todoAccess.updateAttachmentUrl(userId, todoId)
  logger.info("After update attachment url");
  return uploadUrl
}

export async function updateTodoItem(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<void> {


  await todoAccess.updateTodoItem(updateTodoRequest, userId, todoId);

}

export async function deleteTodoItem(userId: string, todoId: string) {
  const item = await getTodoItem(todoId, userId);

  logger.info(item);

  await Promise.all([
    todoAccess.deleteTodoItem(userId, todoId),
    todoAccess.deleteTodoItemAttachment(todoId)
  ])
}
