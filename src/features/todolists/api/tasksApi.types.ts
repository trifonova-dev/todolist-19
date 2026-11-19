import { TaskPriority, TaskStatus } from "@/common/enums"
import { z } from "zod/v4"

export const domainTaskSchema = z.object({
  description: z.string().nullable(),
  deadline: z.string().nullable(),
  startDate: z.iso.datetime({ local: true }).nullable(),
  title: z.string(),
  status: z.enum(TaskStatus),
  priority: z.enum(TaskPriority),
  id: z.string(),
  todoListId: z.string(),
  order: z.int(),
  addedDate: z.iso.datetime({ local: true }),
})

export type DomainTask = z.infer<typeof domainTaskSchema>

export type GetTasksResponse = {
  error: string | null
  totalCount: number
  items: DomainTask[]
}

export type UpdateTaskModel = {
  description: string | null
  title: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string | null
  deadline: string | null
}

const imageSchema = z.object({
  type: z.string(),
  width: z.int(),
  height: z.int(),
  fileSize: z.int(),
  url: z.string(),
})

const attachmentSchema = z.object({
  id: z.string(),
  url: z.string(),
  contentType: z.string(),
  originalName: z.string(),
  fileSize: z.int(),
  isImage: z.boolean(),
  addedAt: z.iso.datetime(),
  images: z.array(imageSchema),
})

export const taskSchema = z.object({
  id: z.string(),
  type: z.string(),
  attributes: z.object({
    title: z.string(),
    addedAt: z.iso.datetime(),
    order: z.number(),
    status: z.enum(TaskStatus),
    priority: z.enum(TaskPriority),
    startDate: z.iso.datetime().nullable(),
    deadline: z.iso.datetime().nullable(),
    updatedAt: z.iso.datetime(),
    attachments: z.array(attachmentSchema),
  }),
  relationships: z.object({
    board: z.object({
      data: z.object({
        id: z.string(),
        type: z.string(),
      }),
    }),
  }),
})

export type Task = z.infer<typeof taskSchema>

export const tasksResponseSchema = z.object({
  data: z.array(taskSchema),
  included: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      attributes: z.object({
        title: z.string(),
      }),
    }),
  ),
  meta: z.object({
    page: z.int(),
    pageSize: z.int(),
    totalCount: z.int(),
    pagesCount: z.int(),
  }),
})

export type TasksResponse = z.infer<typeof tasksResponseSchema>
