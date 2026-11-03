import { MailPlus } from "lucide-react"
import { useState } from "react"

import { InvitationsTable } from "@/features/invitations/components/invitations-table"
import { InviteDialog } from "@/features/invitations/components/invite-dialog"
import { Button } from "@/shared/ui/base/button"
import { PageHeader } from "@/shared/ui/page-header"

export function InvitationsScreen() {
  const [isInviting, setIsInviting] = useState(false)

  return (
    <>
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setIsInviting(true)
            }}
          >
            <MailPlus />
            Inviter
          </Button>
        }
        description="Une invitation est acceptée dès la première connexion du compte."
        title="Invitations"
      />
      <InvitationsTable />
      <InviteDialog onOpenChange={setIsInviting} open={isInviting} />
    </>
  )
}
