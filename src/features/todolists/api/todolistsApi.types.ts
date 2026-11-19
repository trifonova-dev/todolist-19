import { z } from "zod/v4"

export const todolistSchema = z.object({
  id: z.string(),
  title: z.string(),
  addedDate: z.iso.datetime({ local: true }),
  order: z.int(),
})

export type Todolist = z.infer<typeof todolistSchema>

export const boardSchema = z.object({
  id: z.string(),
  type: z.string(),
  attributes: z.object({
    title: z.string(),
    description: z.string(),
    addedAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    order: z.int(),
    isImportant: z.boolean(),
    images: z.object({
      main: z.array(
        z.object({
          type: z.string(),
          width: z.int(),
          height: z.int(),
          fileSize: z.int(),
          url: z.string(),
        }),
      ),
    }),
  }),
})

export type Board = z.infer<typeof boardSchema>

export const boardsResponseSchema = z.object({
  data: z.array(boardSchema),
})

export type BoardsResponse = z.infer<typeof boardsResponseSchema>
