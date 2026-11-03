import { useMutation } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { signInWithPassword } from "@/features/auth/services/auth-service"
import { errorMessage } from "@/shared/lib/errors"
import { Button } from "@/shared/ui/base/button"
import { Input } from "@/shared/ui/base/input"
import { Label } from "@/shared/ui/base/label"
import { BrandMark } from "@/shared/ui/brand-mark"

export function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const signInMutation = useMutation({
    mutationFn: async () => signInWithPassword(email, password),
    onSuccess: () => {
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/organizations"
      void navigate(redirectTo, { replace: true })
    },
  })

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandMark size={56} />
          <h1 className="text-[28px] font-semibold leading-none tracking-tight">
            Themiros
          </h1>
          <p className="text-sm text-muted-foreground">
            Backoffice de la plateforme
          </p>
        </div>

        <form
          className="mt-10 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            signInMutation.mutate()
          }}
        >
          <div className="space-y-2">
            <Label
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="email"
            >
              Adresse e-mail
            </Label>
            <Input
              autoComplete="email"
              className="h-10"
              id="email"
              onChange={(event) => {
                setEmail(event.target.value)
              }}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="password"
            >
              Mot de passe
            </Label>
            <Input
              autoComplete="current-password"
              className="h-10"
              id="password"
              onChange={(event) => {
                setPassword(event.target.value)
              }}
              required
              type="password"
              value={password}
            />
          </div>
          {signInMutation.error ? (
            <p className="text-[13px] text-foreground">
              {errorMessage(signInMutation.error)}
            </p>
          ) : null}
          <Button
            className="h-11 w-full text-[15px] font-semibold"
            disabled={signInMutation.isPending}
            size="lg"
            type="submit"
          >
            {signInMutation.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            Se connecter
          </Button>
        </form>
      </div>
    </main>
  )
}
