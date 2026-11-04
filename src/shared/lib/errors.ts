import { ApiError } from "@/shared/lib/api"

/**
 * Les fonctions backoffice_* levent un code en majuscules (message de
 * l'exception), l'API renvoie le meme code dans `code`. Un code inconnu
 * s'affiche tel quel : il reste cherchable dans la migration.
 */
const messages: Record<string, string> = {
  PLATFORM_ADMIN_REQUIRED: "Réservé aux administrateurs de la plateforme.",
  CANNOT_REVOKE_SELF: "Vous ne pouvez pas retirer vos propres droits.",
  ORGANIZATION_NOT_FOUND: "Organisation introuvable.",
  ORGANIZATION_NAME_REQUIRED: "Le nom de l'organisation est obligatoire.",
  ORGANIZATION_HAS_INVOICES:
    "Cette organisation a été facturée : elle ne peut plus être supprimée.",
  PROFILE_NOT_FOUND: "Profil introuvable.",
  CANNOT_ARCHIVE_SELF: "Vous ne pouvez pas archiver votre propre compte.",
  CANNOT_DELETE_SELF: "Vous ne pouvez pas supprimer votre propre compte.",
  PROFILE_HAS_RECORDS:
    "Ce compte est l'auteur de données dans ses espaces (approches, cadres, documents…) : il ne peut pas être supprimé. Archivez-le plutôt.",
  USER_DELETE_FAILED: "Supabase n'a pas pu supprimer le compte.",
  USER_BAN_FAILED:
    "Supabase n'a pas pu bloquer ou débloquer le compte : rien n'a changé.",
  EMAIL_ALREADY_REGISTERED: "Un compte existe déjà avec cette adresse.",
  WEAK_PASSWORD: "Mot de passe jugé trop faible par Supabase.",
  WORKSPACE_NOT_FOUND: "Espace introuvable.",
  WORKSPACE_NAME_REQUIRED: "Le nom de l'espace est obligatoire.",
  OWNER_NOT_IN_ORGANIZATION:
    "Le responsable doit appartenir à l'organisation de l'espace.",
  MEMBER_NOT_IN_ORGANIZATION:
    "Seul un compte de l'organisation peut rejoindre cet espace.",
  LAST_WORKSPACE_ADMIN:
    "Un espace garde au moins un administrateur : nommez-en un autre d'abord.",
  WORKSPACE_NOT_IN_ORGANIZATION:
    "Un des espaces choisis n'appartient pas à l'organisation.",
  USER_IN_OTHER_ORGANIZATION:
    "Cette adresse appartient déjà à un compte d'une autre organisation.",
  INVITATION_ALREADY_EXISTS:
    "Une invitation existe déjà pour cette adresse dans l'organisation.",
  INVITATION_NOT_FOUND: "Invitation introuvable ou déjà révoquée.",
  INVITATION_NOT_PENDING: "Seule une invitation en attente se renvoie.",
  INVITATION_ALREADY_ACCEPTED:
    "Invitation déjà acceptée : gérez plutôt le profil.",
  INVITATION_EMAIL_FAILED: "L'e-mail d'invitation n'a pas pu être envoyé.",
  SUBSCRIPTION_ALREADY_LIVE:
    "L'organisation a déjà un abonnement en cours : modifiez-le ou résiliez-le.",
  SUBSCRIPTION_NOT_FOUND: "Abonnement introuvable.",
  SUBSCRIPTION_NOT_IN_ORGANIZATION:
    "L'abonnement choisi n'appartient pas à l'organisation.",
  INVOICE_LABEL_REQUIRED: "Le libellé de la facture est obligatoire.",
  INVOICE_NOT_DRAFT: "Seul un brouillon se modifie ou se supprime.",
  INVOICE_DUE_BEFORE_ISSUE: "L'échéance précède la date d'émission.",
  INVOICE_STATUS_TRANSITION_INVALID:
    "Ce changement de statut n'est pas possible pour cette facture.",
}

/* Raison donnee par Supabase quand l'API n'a pas pu faire l'operation
   (SMTP, quota d'e-mails...) : sans elle, impossible de savoir quoi corriger. */
function withUpstreamReason(message: string, error: unknown) {
  const reason =
    error instanceof ApiError ? error.context.upstream_message : undefined
  return typeof reason === "string" && reason
    ? `${message} Supabase : « ${reason} ».`
    : message
}

export function errorMessage(error: unknown) {
  const code =
    error instanceof ApiError
      ? error.code
      : (error as { message?: unknown } | null)?.message

  if (typeof code === "string" && code in messages) {
    return withUpstreamReason(messages[code], error)
  }
  if (error instanceof ApiError) {
    return error.message
  }
  return typeof code === "string" && code ? code : "Erreur inattendue."
}
