import { UserPlus } from "lucide-react"
import { useState } from "react"

import { ProfileCreateDialog } from "@/features/profiles/components/profile-create-dialog"
import { ProfilesTable } from "@/features/profiles/components/profiles-table"
import { Button } from "@/shared/ui/base/button"
import { PageHeader } from "@/shared/ui/page-header"

export function ProfilesScreen() {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <>
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setIsCreating(true)
            }}
          >
            <UserPlus />
            Créer un profil
          </Button>
        }
        description="Tous les comptes de la plateforme. Créez un compte avec son mot de passe, ou invitez la personne par e-mail."
        title="Profils"
      />
      <ProfilesTable />
      <ProfileCreateDialog onOpenChange={setIsCreating} open={isCreating} />
    </>
  )
}
