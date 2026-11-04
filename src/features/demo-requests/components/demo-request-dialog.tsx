import { Mail } from "lucide-react"
import { useState } from "react"

import {
  type DemoRequest,
  type DemoRequestStatus,
  demoRequestStatuses,
  demoRequestStatusLabels,
} from "@/features/demo-requests/model/types"
import { updateDemoRequest } from "@/features/demo-requests/services/demo-request-service"
import { useAdminMutation } from "@/shared/hooks/use-admin-mutation"
import { formatDateTime } from "@/shared/lib/format"
import { Button } from "@/shared/ui/base/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/base/dialog"
import { Field } from "@/shared/ui/field"
import { NativeSelect } from "@/shared/ui/native-select"
import { Textarea } from "@/shared/ui/textarea"

export function replyHref(request: DemoRequest) {
  const subject = encodeURIComponent("Votre demande de démonstration Themiros")
  return `mailto:${request.email}?subject=${subject}`
}

type DemoRequestDialogProps = {
  onOpenChange: (open: boolean) => void
  request: DemoRequest | null
}

export function DemoRequestDialog({
  onOpenChange,
  request,
}: DemoRequestDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={request !== null}>
      <DialogContent className="sm:max-w-xl">
        {/* Remonte a chaque ouverture : le formulaire repart de la demande. */}
        {request ? (
          <DemoRequestForm
            onDone={() => {
              onOpenChange(false)
            }}
            request={request}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DemoRequestForm({
  onDone,
  request,
}: {
  onDone: () => void
  request: DemoRequest
}) {
  const [status, setStatus] = useState<DemoRequestStatus>(request.status)
  const [notes, setNotes] = useState(request.notes ?? "")
  const mutation = useAdminMutation({
    mutationFn: updateDemoRequest,
    success: "Demande mise à jour",
    onSuccess: onDone,
  })

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        mutation.mutate({ id: request.id, status, notes })
      }}
    >
      <DialogHeader>
        <DialogTitle>{request.name}</DialogTitle>
        <DialogDescription>
          {request.organisation} · reçue le {formatDateTime(request.createdAt)}
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4 pb-1">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">E-mail</dt>
          <dd className="min-w-0 break-all">
            <a className="hover:underline" href={replyHref(request)}>
              {request.email}
            </a>
          </dd>
          <dt className="text-muted-foreground">Message</dt>
          <dd className="whitespace-pre-wrap">{request.context ?? "—"}</dd>
          {request.source ? (
            <>
              <dt className="text-muted-foreground">Origine</dt>
              <dd className="text-muted-foreground">{request.source}</dd>
            </>
          ) : null}
          {request.updatedAt ? (
            <>
              <dt className="text-muted-foreground">Suivi</dt>
              <dd className="text-muted-foreground">
                {request.handledByName ?? "Compte supprimé"},{" "}
                {formatDateTime(request.updatedAt)}
              </dd>
            </>
          ) : null}
        </dl>
        <Field htmlFor="demo-request-status" label="Statut">
          <NativeSelect
            id="demo-request-status"
            onChange={(event) => {
              setStatus(event.target.value as DemoRequestStatus)
            }}
            value={status}
          >
            {demoRequestStatuses.map((value) => (
              <option key={value} value={value}>
                {demoRequestStatusLabels[value]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          htmlFor="demo-request-notes"
          hint="Visibles des seuls administrateurs : créneau convenu, interlocuteur, suite donnée…"
          label="Notes internes"
        >
          <Textarea
            id="demo-request-notes"
            onChange={(event) => {
              setNotes(event.target.value)
            }}
            rows={4}
            value={notes}
          />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button asChild variant="outline">
          <a href={replyHref(request)}>
            <Mail />
            Répondre
          </a>
        </Button>
        <Button disabled={mutation.isPending} type="submit">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
