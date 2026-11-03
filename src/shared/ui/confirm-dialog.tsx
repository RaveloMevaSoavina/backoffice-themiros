import type { ReactNode } from "react"

import { Button } from "@/shared/ui/base/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/base/dialog"

type ConfirmDialogProps = {
  confirmLabel: string
  description: ReactNode
  destructive?: boolean
  isPending?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

export function ConfirmDialog({
  confirmLabel,
  description,
  destructive = false,
  isPending = false,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              onOpenChange(false)
            }}
            variant="outline"
          >
            Annuler
          </Button>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            variant={destructive ? "destructive" : "default"}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
