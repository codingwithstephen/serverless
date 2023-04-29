import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from './todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

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

export async function getTodoItem(todoId: string): Promise<TodoItem>{
  return await todoAccess.getTodoITem(todoId);

}

export async function generateUploadUrl(userId: string, todoId: string): Promise<string> {
  const uploadUrl = await todoAccess.getSignedUrl(todoId)
  await todoAccess.updateAttachmentUrl(userId, todoId)

  return uploadUrl
}

export async function updateTodoItem(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<void> {

  await todoAccess.updateTodoItem(updateTodoRequest, userId, todoId)
}

export async function deleteTodoItem(userId: string, todoId: string) {
  const item = await getTodoItem(todoId);

  if (!item){
    throw new Error("No todo item exists with this id")
  }

  if (item.userId !== userId) {
    throw new Error('User ' + userId + ' is not authorized to delete item');
  }

  await Promise.all([
    todoAccess.deleteTodoItem(userId, todoId),
    todoAccess.deleteTodoItemAttachment(todoId)
  ])
}
