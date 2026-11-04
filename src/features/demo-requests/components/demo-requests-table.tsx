import { MoreHorizontal } from "lucide-react"
import { useMemo, useState } from "react"

import {
  DemoRequestDialog,
  replyHref,
} from "@/features/demo-requests/components/demo-request-dialog"
import {
  type DemoRequest,
  type DemoRequestStatus,
  demoRequestStatuses,
  demoRequestStatusLabels,
} from "@/features/demo-requests/model/types"
import { deleteDemoRequest } from "@/features/demo-requests/services/demo-request-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDateTime } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/base/dropdown-menu"
import { Input } from "@/shared/ui/base/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { NativeSelect } from "@/shared/ui/native-select"
import { EmptyRow } from "@/shared/ui/query-state"

const statusVariant = {
  new: "warning",
  contacted: "secondary",
  scheduled: "secondary",
  completed: "outline",
  declined: "outline",
} as const

/* Par defaut on masque ce qui est clos : la liste sert d'abord a traiter. */
type StatusFilter = DemoRequestStatus | "open" | "all"

const openStatuses: DemoRequestStatus[] = ["new", "contacted", "scheduled"]

function matches(request: DemoRequest, search: string) {
  if (!search) return true
  return [request.name, request.organisation, request.email, request.context]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(search))
}

export function DemoRequestsTable({ requests }: { requests: DemoRequest[] }) {
  const [status, setStatus] = useState<StatusFilter>("open")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<DemoRequest | null>(null)
  const [deleting, setDeleting] = useState<DemoRequest | null>(null)
  const deleteMutation = useAdminMutation({
    mutationFn: deleteDemoRequest,
    success: "Demande supprimée",
    onSuccess: () => {
      setDeleting(null)
    },
  })

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return requests.filter(
      (request) =>
        (status === "all" ||
          (status === "open"
            ? openStatuses.includes(request.status)
            : request.status === status)) &&
        matches(request, needle)
    )
  }, [requests, search, status])

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Rechercher"
          className="sm:max-w-64"
          onChange={(event) => {
            setSearch(event.target.value)
          }}
          placeholder="Nom, organisation, e-mail…"
          type="search"
          value={search}
        />
        <NativeSelect
          aria-label="Filtrer par statut"
          className="sm:max-w-48"
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter)
          }}
          value={status}
        >
          <option value="open">À traiter</option>
          <option value="all">Tous les statuts</option>
          {demoRequestStatuses.map((value) => (
            <option key={value} value={value}>
              {demoRequestStatusLabels[value]}
            </option>
          ))}
        </NativeSelect>
      </div>

      {visible.length === 0 ? (
        <EmptyRow>Aucune demande de démonstration.</EmptyRow>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Demandeur</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Reçue le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <button
                    className="text-left font-medium hover:underline"
                    onClick={() => {
                      setEditing(request)
                    }}
                    type="button"
                  >
                    {request.name}
                  </button>
                  <div className="text-xs text-muted-foreground">
                    {request.email}
                  </div>
                </TableCell>
                <TableCell>{request.organisation}</TableCell>
                <TableCell className="max-w-72 text-muted-foreground">
                  <span
                    className="block truncate"
                    title={request.context ?? undefined}
                  >
                    {request.context ?? "—"}
                  </span>
                  {request.notes ? (
                    <span
                      className="block truncate text-xs"
                      title={request.notes}
                    >
                      Note : {request.notes}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(request.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={statusVariant[request.status]}>
                      {demoRequestStatusLabels[request.status]}
                    </Badge>
                    {/* La fonction demo-request n'a pas pu relayer l'e-mail :
                        l'equipe n'a ete prevenue que par cet ecran. */}
                    {request.notified ? null : (
                      <Badge
                        title="L'e-mail de notification à l'équipe n'est pas parti."
                        variant="outline"
                      >
                        Non notifiée
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label="Actions"
                        size="icon-sm"
                        variant="ghost"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditing(request)
                        }}
                      >
                        Suivi et notes
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={replyHref(request)}>Répondre par e-mail</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setDeleting(request)
                        }}
                        variant="destructive"
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <DemoRequestDialog
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        request={editing}
      />

      <ConfirmDialog
        confirmLabel="Supprimer"
        description={`La demande de ${deleting?.name} (${deleting?.organisation}) sera effacée définitivement. Pour une demande simplement sans suite, préférez le statut « Sans suite ».`}
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id)
        }}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        open={deleting !== null}
        title="Supprimer la demande"
      />
    </>
  )
}
