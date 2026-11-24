/*
 * Lien vers l'objet dans le tableau de bord Stripe. Mode test par défaut ;
 * en production : VITE_STRIPE_DASHBOARD_URL=https://dashboard.stripe.com
 */
const dashboardUrl = (
  import.meta.env.VITE_STRIPE_DASHBOARD_URL ??
  "https://dashboard.stripe.com/test"
).replace(/\/$/, "")

export function stripeDashboardLink(
  kind: "subscriptions" | "invoices",
  id: string
) {
  return `${dashboardUrl}/${kind}/${id}`
}
