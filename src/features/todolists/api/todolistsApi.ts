import { baseApi } from "@/app/baseApi"
import { instance } from "@/common/instance"
import type { BaseResponse } from "@/common/types"
import type { DomainTodolist } from "@/features/todolists/model/todolists-slice"
import type { Board, BoardsResponse, Todolist } from "./todolistsApi.types"

export const todolistsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodolists: build.query<DomainTodolist[], void>({
      query: () => "/boards/my",
      transformResponse: (response: BoardsResponse): DomainTodolist[] =>
        response.data.map((board) => ({
          id: board.id,
          title: board.attributes.title,
          addedDate: board.attributes.addedAt,
          order: board.attributes.order,
          filter: "all",
          entityStatus: "idle",
        })),
      providesTags: ["Todolist"],
    }),
    addTodolist: build.mutation<{ data: Board }, string>({
      query: (title) => ({
        url: "/boards",
        method: "POST",
        body: {
          data: {
            type: "boards",
            attributes: {
              title,
              description: "",
            },
          },
        },
      }),
      invalidatesTags: ["Todolist"],
    }),
    removeTodolist: build.mutation<void, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todolist"],
    }),
    updateTodolistTitle: build.mutation<{ data: Board }, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/boards/${id}`,
        method: "PATCH",
        body: {
          data: {
            type: "boards",
            attributes: {
              title,
            },
          },
        },
      }),
      invalidatesTags: ["Todolist"],
    }),
  }),
})

export const {
  useGetTodolistsQuery,
  useAddTodolistMutation,
  useRemoveTodolistMutation,
  useUpdateTodolistTitleMutation,
} = todolistsApi

export const _todolistsApi = {
  getTodolists() {
    return instance.get<Todolist[]>("/todo-lists")
  },
  changeTodolistTitle(payload: { id: string; title: string }) {
    const { id, title } = payload
    return instance.put<BaseResponse>(`/todo-lists/${id}`, { title })
  },
  createTodolist(title: string) {
    return instance.post<BaseResponse<{ item: Todolist }>>("/todo-lists", { title })
  },
  deleteTodolist(id: string) {
    return instance.delete<BaseResponse>(`/todo-lists/${id}`)
  },
}
