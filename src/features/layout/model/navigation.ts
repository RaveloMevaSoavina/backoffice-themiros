import {
  Building2,
  CalendarClock,
  FolderKanban,
  type LucideIcon,
  MailPlus,
  Receipt,
  Users,
} from "lucide-react"

export type NavItem = {
  icon: LucideIcon
  label: string
  path: string
}

export const navItems: NavItem[] = [
  { icon: Building2, label: "Organisations", path: "/organizations" },
  { icon: Users, label: "Profils", path: "/profiles" },
  { icon: MailPlus, label: "Invitations", path: "/invitations" },
  { icon: FolderKanban, label: "Projets", path: "/projects" },
  { icon: Receipt, label: "Facturation", path: "/billing" },
  { icon: CalendarClock, label: "Demandes de démo", path: "/demo-requests" },
]
