import { Outlet } from "react-router-dom"

import { BackofficeSidebar } from "@/features/layout/components/backoffice-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/base/sidebar"

export function BackofficeLayout() {
  return (
    <SidebarProvider>
      <BackofficeSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-[62px] shrink-0 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="text-[13px] font-semibold">
            Administration de la plateforme
          </span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
