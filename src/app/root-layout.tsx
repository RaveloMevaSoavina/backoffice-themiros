import { Outlet } from "react-router-dom"

import { ThemeProvider } from "@/shared/theme/theme-provider"

export function RootLayout() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}
