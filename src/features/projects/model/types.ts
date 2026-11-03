import type {
  WorkspaceKind,
  WorkspaceRole,
  WorkspaceStage,
} from "@/shared/lib/labels"

/** Un espace de travail : projet, programme ou politique evalue. */
export type WorkspaceSummary = {
  id: string
  name: string
  kind: WorkspaceKind
  organizationId: string
  organizationName: string
  targetCountry: string | null
  declaredStage: WorkspaceStage | null
  startYear: number | null
  endYear: number | null
  frameworkStatus: string
  createdAt: string
  memberCount: number
  documentCount: number
  runCount: number
  lastRunAt: string | null
  aiCostEur: number
}

export type WorkspaceMember = {
  profileId: string
  fullName: string | null
  email: string
  role: WorkspaceRole
  addedAt: string
}

export type WorkspaceDetails = Omit<WorkspaceSummary, "memberCount"> & {
  createdByName: string | null
  members: WorkspaceMember[]
}

export type WorkspaceInput = {
  name: string
  targetCountry: string
  declaredStage: WorkspaceStage | ""
  startYear: number | null
  endYear: number | null
}

export type CreateWorkspaceInput = WorkspaceInput & {
  organizationId: string
  kind: WorkspaceKind
  ownerProfileId: string
}
