import type {
  Profile,
  ProfileCreateInput,
  ProfileInput,
} from "@/features/profiles/model/types"
import { apiRequest } from "@/shared/lib/api"
import { accessToken, supabase } from "@/shared/lib/supabase"

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  role: Profile["role"]
  lang: string
  organization_id: string | null
  organization_name: string | null
  is_platform_admin: boolean
  workspace_count: number
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  archived_at: string | null
  archived_by_name: string | null
  created_at: string
}

export async function listProfiles(
  organizationId?: string
): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("backoffice_list_profiles", {
    p_organization_id: organizationId ?? null,
  })
  if (error) throw error
  return (data as ProfileRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    lang: row.lang,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    isPlatformAdmin: row.is_platform_admin,
    workspaceCount: Number(row.workspace_count),
    emailConfirmedAt: row.email_confirmed_at,
    lastSignInAt: row.last_sign_in_at,
    archivedAt: row.archived_at,
    archivedByName: row.archived_by_name,
    createdAt: row.created_at,
  }))
}

/* Creer un compte demande la cle serveur : il passe par l'API. */
export async function createProfile(input: ProfileCreateInput) {
  return apiRequest<{ id: string }>("/api/v1/admin/profiles", {
    method: "POST",
    accessToken: await accessToken(),
    body: JSON.stringify({
      organization_id: input.organizationId,
      email: input.email.trim(),
      full_name: input.fullName.trim() || null,
      password: input.password,
      role: input.role,
      workspace_ids: input.workspaceIds,
      workspace_role: input.workspaceRole,
    }),
  })
}

/* Archiver bloque la connexion cote Supabase Auth (cle serveur) : par l'API. */
export async function setProfileArchived(input: {
  profileId: string
  archived: boolean
}) {
  const action = input.archived ? "archive" : "restore"
  await apiRequest<void>(
    `/api/v1/admin/profiles/${input.profileId}/${action}`,
    {
      method: "POST",
      accessToken: await accessToken(),
    }
  )
}

/* Suppression definitive (GoTrue, cle serveur) : par l'API. Refusee si le
   compte est l'auteur de donnees : il s'archive alors. */
export async function deleteProfile(profileId: string) {
  await apiRequest<void>(`/api/v1/admin/profiles/${profileId}/delete`, {
    method: "POST",
    accessToken: await accessToken(),
  })
}

export async function updateProfile(input: ProfileInput) {
  const { error } = await supabase.rpc("backoffice_update_profile", {
    p_profile_id: input.id,
    p_full_name: input.fullName,
    p_role: input.role,
    p_organization_id: input.organizationId,
  })
  if (error) throw error
}

export async function setPlatformAdmin(input: {
  profileId: string
  enabled: boolean
}) {
  const { error } = await supabase.rpc("backoffice_set_platform_admin", {
    p_profile_id: input.profileId,
    p_enabled: input.enabled,
  })
  if (error) throw error
}
