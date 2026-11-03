import type {
  CreateWorkspaceInput,
  WorkspaceDetails,
  WorkspaceInput,
  WorkspaceSummary,
} from "@/features/projects/model/types"
import type { WorkspaceRole } from "@/shared/lib/labels"
import { supabase } from "@/shared/lib/supabase"

type WorkspaceRow = {
  id: string
  name: string
  kind: WorkspaceSummary["kind"]
  organization_id: string
  organization_name: string
  target_country: string | null
  declared_stage: WorkspaceSummary["declaredStage"]
  start_year: number | null
  end_year: number | null
  framework_status: string
  created_at: string
  member_count?: number
  document_count: number
  run_count: number
  last_run_at: string | null
  ai_cost_eur: number | string
}

type WorkspaceDetailsRow = WorkspaceRow & {
  created_by_name: string | null
  members: {
    profile_id: string
    full_name: string | null
    email: string
    role: WorkspaceRole
    added_at: string
  }[]
}

function toWorkspace(row: WorkspaceRow) {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    targetCountry: row.target_country,
    declaredStage: row.declared_stage,
    startYear: row.start_year,
    endYear: row.end_year,
    frameworkStatus: row.framework_status,
    createdAt: row.created_at,
    documentCount: Number(row.document_count),
    runCount: Number(row.run_count),
    lastRunAt: row.last_run_at,
    aiCostEur: Number(row.ai_cost_eur),
  }
}

export async function listWorkspaces(
  organizationId?: string
): Promise<WorkspaceSummary[]> {
  const { data, error } = await supabase.rpc("backoffice_list_workspaces", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as WorkspaceRow[]).map((row) => ({
    ...toWorkspace(row),
    memberCount: Number(row.member_count ?? 0),
  }))
}

export async function getWorkspace(id: string): Promise<WorkspaceDetails> {
  const { data, error } = await supabase.rpc("backoffice_get_workspace", {
    p_workspace_id: id,
  })
  if (error) throw error
  const row = data as WorkspaceDetailsRow
  return {
    ...toWorkspace(row),
    createdByName: row.created_by_name,
    members: row.members.map((member) => ({
      profileId: member.profile_id,
      fullName: member.full_name,
      email: member.email,
      role: member.role,
      addedAt: member.added_at,
    })),
  }
}

export async function createWorkspace(input: CreateWorkspaceInput) {
  const { data, error } = await supabase.rpc("backoffice_create_workspace", {
    p_organization_id: input.organizationId,
    p_name: input.name,
    p_kind: input.kind,
    p_target_country: input.targetCountry,
    p_declared_stage: input.declaredStage,
    p_start_year: input.startYear,
    p_end_year: input.endYear,
    p_owner_profile_id: input.ownerProfileId,
  })
  if (error) throw error
  return data as string
}

export async function updateWorkspace(id: string, input: WorkspaceInput) {
  const { error } = await supabase.rpc("backoffice_update_workspace", {
    p_workspace_id: id,
    p_name: input.name,
    p_target_country: input.targetCountry,
    p_declared_stage: input.declaredStage,
    p_start_year: input.startYear,
    p_end_year: input.endYear,
  })
  if (error) throw error
}

export async function deleteWorkspace(id: string) {
  const { error } = await supabase.rpc("backoffice_delete_workspace", {
    p_workspace_id: id,
  })
  if (error) throw error
}

export async function setWorkspaceMember(input: {
  workspaceId: string
  profileId: string
  role: WorkspaceRole
}) {
  const { error } = await supabase.rpc("backoffice_set_workspace_member", {
    p_workspace_id: input.workspaceId,
    p_profile_id: input.profileId,
    p_role: input.role,
  })
  if (error) throw error
}

export async function removeWorkspaceMember(input: {
  workspaceId: string
  profileId: string
}) {
  const { error } = await supabase.rpc("backoffice_remove_workspace_member", {
    p_workspace_id: input.workspaceId,
    p_profile_id: input.profileId,
  })
  if (error) throw error
}
