import { useQuery } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import {
  type InvoiceDateAction,
  InvoiceDateDialog,
} from "@/features/billing/components/invoice-date-dialog"
import { InvoiceDialog } from "@/features/billing/components/invoice-dialog"
import {
  type Invoice,
  invoiceStatusLabels,
} from "@/features/billing/model/types"
import {
  deleteInvoice,
  listInvoices,
  setInvoiceStatus,
} from "@/features/billing/services/billing-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDate, formatPreciseEur } from "@/shared/lib/format"
import { Badge } from "@/shared/ui/base/badge"
import { Button } from "@/shared/ui/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/base/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/base/table"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { EmptyRow, QueryState } from "@/shared/ui/query-state"

type ConfirmAction = { kind: "void" | "delete" | "unpay"; invoice: Invoice }

const confirmCopy = {
  void: {
    title: "Annuler la facture",
    label: "Annuler la facture",
    description: (invoice: Invoice) =>
      `La facture ${invoice.number} reste dans la numérotation, marquée annulée. Émettez-en une autre si besoin.`,
  },
  delete: {
    title: "Supprimer le brouillon",
    label: "Supprimer",
    description: (invoice: Invoice) =>
      `Le brouillon « ${invoice.label} » sera supprimé.`,
  },
  unpay: {
    title: "Annuler l'encaissement",
    label: "Annuler l'encaissement",
    description: (invoice: Invoice) =>
      `La facture ${invoice.number} repasse en attente de paiement.`,
  },
}

function InvoiceStatusBadge({ invoice }: { invoice: Invoice }) {
  if (invoice.overdue) {
    return <Badge variant="warning">En retard</Badge>
  }
  return (
    <Badge
      variant={
        invoice.status === "paid"
          ? "secondary"
          : invoice.status === "issued"
            ? "default"
            : "outline"
      }
    >
      {invoiceStatusLabels[invoice.status]}
    </Badge>
  )
}

type InvoicesTableProps = {
  organizationId?: string
}

export function InvoicesTable({ organizationId }: InvoicesTableProps) {
  const invoices = useQuery({
    queryKey: ["billing", "invoices", organizationId ?? "all"],
    queryFn: () => listInvoices(organizationId),
  })
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [dateAction, setDateAction] = useState<InvoiceDateAction | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const closeConfirm = () => {
    setConfirm(null)
  }
  const voidOrUnpay = useAdminMutation({
    mutationFn: setInvoiceStatus,
    success: "Facture mise à jour",
    onSuccess: closeConfirm,
  })
  const remove = useAdminMutation({
    mutationFn: deleteInvoice,
    success: "Brouillon supprimé",
    onSuccess: closeConfirm,
  })

  return (
    <>
      <QueryState error={invoices.error} isLoading={invoices.isLoading}>
        {(invoices.data ?? []).length === 0 ? (
          <EmptyRow>Aucune facture.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                {organizationId ? null : <TableHead>Organisation</TableHead>}
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">HT</TableHead>
                <TableHead className="text-right">TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoices.data ?? []).map((invoice) => (
                <TableRow
                  className={invoice.status === "void" ? "opacity-60" : ""}
                  key={invoice.id}
                >
                  <TableCell className="font-mono text-xs">
                    {invoice.number ?? "—"}
                  </TableCell>
                  {organizationId ? null : (
                    <TableCell>
                      <Link
                        className="hover:underline"
                        to={`/organizations/${invoice.organizationId}`}
                      >
                        {invoice.organizationName}
                      </Link>
                    </TableCell>
                  )}
                  <TableCell className="max-w-72">
                    <span className="block truncate" title={invoice.label}>
                      {invoice.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPreciseEur(invoice.amountEur)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPreciseEur(invoice.totalEur)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge invoice={invoice} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.status === "paid"
                      ? `Payée le ${formatDate(invoice.paidOn)}`
                      : formatDate(invoice.dueOn)}
                  </TableCell>
                  <TableCell>
                    {invoice.status === "void" ? null : (
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
                          {invoice.status === "draft" ? (
                            <>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditing(invoice)
                                }}
                              >
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setDateAction({ kind: "issue", invoice })
                                }}
                              >
                                Émettre
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setConfirm({ kind: "delete", invoice })
                                }}
                                variant="destructive"
                              >
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          {invoice.status === "issued" ? (
                            <>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setDateAction({ kind: "pay", invoice })
                                }}
                              >
                                Enregistrer le paiement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setConfirm({ kind: "void", invoice })
                                }}
                                variant="destructive"
                              >
                                Annuler la facture
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          {invoice.status === "paid" ? (
                            <DropdownMenuItem
                              onSelect={() => {
                                setConfirm({ kind: "unpay", invoice })
                              }}
                            >
                              Annuler l'encaissement
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>

      <InvoiceDialog
        invoice={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        open={editing !== null}
      />
      <InvoiceDateDialog
        action={dateAction}
        onOpenChange={(open) => {
          if (!open) setDateAction(null)
        }}
      />
      <ConfirmDialog
        confirmLabel={confirm ? confirmCopy[confirm.kind].label : ""}
        description={
          confirm ? confirmCopy[confirm.kind].description(confirm.invoice) : ""
        }
        destructive={confirm?.kind !== "unpay"}
        isPending={voidOrUnpay.isPending || remove.isPending}
        onConfirm={() => {
          if (!confirm) return
          if (confirm.kind === "delete") {
            remove.mutate(confirm.invoice.id)
          } else {
            voidOrUnpay.mutate({
              id: confirm.invoice.id,
              status: confirm.kind === "void" ? "void" : "issued",
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) closeConfirm()
        }}
        open={confirm !== null}
        title={confirm ? confirmCopy[confirm.kind].title : ""}
      />
    </>
  )
}
