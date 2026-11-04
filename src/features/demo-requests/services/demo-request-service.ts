import type {
  DemoRequest,
  DemoRequestInput,
} from "@/features/demo-requests/model/types"
import { supabase } from "@/shared/lib/supabase"

type DemoRequestRow = {
  id: string
  created_at: string
  name: string
  organisation: string
  email: string
  context: string | null
  source: string | null
  notified: boolean
  status: DemoRequest["status"]
  notes: string | null
  handled_by_name: string | null
  updated_at: string | null
}

export async function listDemoRequests(): Promise<DemoRequest[]> {
  const { data, error } = await supabase.rpc("backoffice_list_demo_requests")
  if (error) throw error
  return (data as DemoRequestRow[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    organisation: row.organisation,
    email: row.email,
    context: row.context,
    source: row.source,
    notified: row.notified,
    status: row.status,
    notes: row.notes,
    handledByName: row.handled_by_name,
    updatedAt: row.updated_at,
  }))
}

export async function updateDemoRequest(input: DemoRequestInput) {
  const { error } = await supabase.rpc("backoffice_update_demo_request", {
    p_id: input.id,
    p_status: input.status,
    p_notes: input.notes,
  })
  if (error) throw error
}

export async function deleteDemoRequest(id: string) {
  const { error } = await supabase.rpc("backoffice_delete_demo_request", {
    p_id: id,
  })
  if (error) throw error
}
