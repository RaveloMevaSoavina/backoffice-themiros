import { ProfilesTable } from "@/features/profiles/components/profiles-table"
import { PageHeader } from "@/shared/ui/page-header"

export function ProfilesScreen() {
  return (
    <>
      <PageHeader
        description="Tous les comptes de la plateforme. Pour ajouter quelqu'un, passez par une invitation."
        title="Profils"
      />
      <ProfilesTable />
    </>
  )
}
