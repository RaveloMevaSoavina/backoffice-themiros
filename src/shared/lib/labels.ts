/**
 * Libelles d'interface des valeurs stockees en base. Les termes suivent le
 * Glossaire du dashboard (`docs/Glossaire.md`).
 */
export const profileRoles = ["admin", "decideur", "pmu", "analyste"] as const
export type ProfileRole = (typeof profileRoles)[number]

export const profileRoleLabels: Record<ProfileRole, string> = {
  admin: "Administrateur",
  decideur: "Décideur",
  pmu: "Chef de projet / PMU",
  analyste: "Analyste",
}

export const workspaceRoles = ["admin", "member", "viewer"] as const
export type WorkspaceRole = (typeof workspaceRoles)[number]

export const workspaceRoleLabels: Record<WorkspaceRole, string> = {
  admin: "Administrateur",
  member: "Membre",
  viewer: "Lecteur",
}

export const organizationTypes = [
  "government",
  "donor",
  "ngo",
  "agency",
  "regional",
] as const
export type OrganizationType = (typeof organizationTypes)[number]

export const organizationTypeLabels: Record<OrganizationType, string> = {
  government: "Gouvernement",
  donor: "Bailleur",
  ngo: "ONG",
  agency: "Agence",
  regional: "Organisation régionale",
}

export const workspaceKinds = ["project", "program", "policy"] as const
export type WorkspaceKind = (typeof workspaceKinds)[number]

export const workspaceKindLabels: Record<WorkspaceKind, string> = {
  project: "Projet",
  program: "Programme",
  policy: "Politique",
}

export const workspaceStages = [
  "design",
  "pre_launch",
  "implementation",
  "mid_term",
  "closing",
  "post_closure",
  "cross_cutting",
] as const
export type WorkspaceStage = (typeof workspaceStages)[number]

export const workspaceStageLabels: Record<WorkspaceStage, string> = {
  design: "Conception",
  pre_launch: "Pré-lancement",
  implementation: "Mise en œuvre",
  mid_term: "Mi-parcours",
  closing: "Clôture",
  post_closure: "Post-clôture",
  cross_cutting: "Transversal",
}

export const frameworkStatusLabels: Record<string, string> = {
  draft: "Cadre en brouillon",
  validated: "Cadre validé",
  locked: "Cadre verrouillé",
}

export function labelOf<T extends string>(
  labels: Record<T, string>,
  value: string | null | undefined
) {
  return value && value in labels ? labels[value as T] : (value ?? "—")
}
