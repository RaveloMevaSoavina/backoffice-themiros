export const demoRequestStatuses = [
  "new",
  "contacted",
  "scheduled",
  "completed",
  "declined",
] as const
export type DemoRequestStatus = (typeof demoRequestStatuses)[number]

export const demoRequestStatusLabels: Record<DemoRequestStatus, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  scheduled: "Démo planifiée",
  completed: "Démo réalisée",
  declined: "Sans suite",
}

/** Demande de démonstration envoyée depuis la landing page. */
export type DemoRequest = {
  id: string
  createdAt: string
  name: string
  organisation: string
  email: string
  context: string | null
  source: string | null
  /** L'e-mail de relais à l'équipe est bien parti. */
  notified: boolean
  status: DemoRequestStatus
  notes: string | null
  handledByName: string | null
  updatedAt: string | null
}

export type DemoRequestInput = {
  id: string
  status: DemoRequestStatus
  notes: string
}
