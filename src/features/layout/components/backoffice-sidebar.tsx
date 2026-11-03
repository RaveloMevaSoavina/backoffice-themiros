import { LogOut, Moon, Sun } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { useAuth } from "@/features/auth/model/auth-provider"
import { navItems } from "@/features/layout/model/navigation"
import { useTheme } from "@/shared/theme/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/shared/ui/base/sidebar"
import { BrandMark } from "@/shared/ui/brand-mark"

export function BackofficeSidebar() {
  const { pathname } = useLocation()
  const { session, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()

  /* Sur mobile la barre est un tiroir superpose : le choix d'une entree
     doit le refermer. */
  const closeOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <NavLink onClick={closeOnMobile} to="/organizations">
                <BrandMark className="size-8! shrink-0" size={32} />
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="text-base font-semibold tracking-tight">
                    Themiros
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Backoffice
                  </span>
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.path)}
                    tooltip={item.label}
                  >
                    <NavLink onClick={closeOnMobile} to={item.path}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="ml-0 mr-2" />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark")
              }}
              tooltip="Changer de thème"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span>{theme === "dark" ? "Thème clair" : "Thème sombre"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                void signOut()
              }}
              tooltip="Se déconnecter"
            >
              <LogOut />
              <span className="truncate">
                {session?.user.email ?? "Se déconnecter"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
