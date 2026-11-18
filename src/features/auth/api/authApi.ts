import { baseApi } from "@/app/baseApi.ts"
import type { BaseResponse } from "@/common/types"
import type { LoginInputs } from "@/features/auth/lib/schemas"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string; refreshToken: string }, LoginInputs>({
      query: (body) => ({ method: "post", url: "auth/simple/login", body }),
    }),
    logout: builder.mutation<BaseResponse, void>({
      query: () => ({ method: "delete", url: "auth/login" }),
    }),
    me: builder.query<BaseResponse<{ id: number; email: string; login: string }>, void>({
      query: () => "auth/me",
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi
