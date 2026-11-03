import { useQuery } from "@tanstack/react-query"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/features/auth/model/auth-provider"
import { isPlatformAdmin } from "@/features/auth/services/auth-service"
import { errorMessage } from "@/shared/lib/errors"
import { Button } from "@/shared/ui/base/button"
import { BrandMark } from "@/shared/ui/brand-mark"
import { GlobalLoader } from "@/shared/ui/global-loader"

const loaderSteps = [
  "Restauration de la session...",
  "Vérification des droits d'administration...",
]

export function AuthGuard() {
  const { isLoading, session, signOut } = useAuth()
  const location = useLocation()
  const userId = session?.user.id
  const adminQuery = useQuery({
    queryKey: ["auth", "platform-admin", userId],
    queryFn: isPlatformAdmin,
    enabled: Boolean(userId),
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (isLoading || (session && adminQuery.isLoading)) {
    return (
      <GlobalLoader
        eyebrow="Backoffice"
        message="Ouverture du backoffice..."
        steps={loaderSteps}
      />
    )
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (adminQuery.data !== true) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <BrandMark size={48} />
        <div className="max-w-sm space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {adminQuery.error ? "Droits non vérifiés" : "Accès réservé"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {adminQuery.error
              ? `La vérification des droits a échoué : ${errorMessage(adminQuery.error)}`
              : `Le compte ${session.user.email} n'administre pas la plateforme Themiros. Demandez à un administrateur de vous ajouter depuis la page Profils.`}
          </p>
        </div>
        <Button
          onClick={() => {
            void signOut()
          }}
          variant="outline"
        >
          Se déconnecter
        </Button>
      </main>
    )
  }

  return <Outlet />
}
