import { Plus } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog"
import { ProjectsTable } from "@/features/projects/components/projects-table"
import { Button } from "@/shared/ui/base/button"
import { PageHeader } from "@/shared/ui/page-header"

export function ProjectsScreen() {
  const navigate = useNavigate()
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
            <Plus />
            Nouvel espace
          </Button>
        }
        description="Projets, programmes et politiques évalués, toutes organisations confondues."
        title="Projets"
      />
      <ProjectsTable />
      <ProjectFormDialog
        onOpenChange={setIsCreating}
        onSaved={(id) => {
          void navigate(`/projects/${id}`)
        }}
        open={isCreating}
      />
    </>
  )
}
