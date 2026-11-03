import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/model/auth-provider"

export function PublicOnlyRoute() {
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return null
  }

  if (session) {
    return <Navigate replace to="/organizations" />
  }

  return <Outlet />
}
