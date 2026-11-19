import { baseApi } from "@/app/baseApi.ts"
import type { LoginInputs } from "@/features/auth/lib/schemas"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string; refreshToken: string }, LoginInputs>({
      query: (body) => ({ method: "post", url: "auth/simple/login", body }),
    }),
    logout: builder.mutation<
      void,
      {
        refreshToken: string
      }
    >({
      query: (body) => ({ method: "post", url: "auth/simple/logout", body }),
    }),
    me: builder.query<
      {
        userId: string
        login: string
      },
      void
    >({
      query: () => "auth/me",
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi
