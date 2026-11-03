/**
 * Formats de la charte (Glossaire, « Typographie ») : espace insecable avant
 * `%` et `€`, milliers separes par une espace insecable. Intl les produit
 * en fr-FR.
 */
const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const preciseEuro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integer = new Intl.NumberFormat("fr-FR")

const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" })

const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatEur(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : euro.format(value)
}

/** Centimes visibles : couts IA et montants de facture. */
export function formatPreciseEur(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : preciseEuro.format(value)
}

export function formatInteger(value: number) {
  return integer.format(value)
}

export function formatDate(value: string | null | undefined) {
  return value ? date.format(new Date(value)) : "—"
}

export function formatDateTime(value: string | null | undefined) {
  return value ? dateTime.format(new Date(value)) : "—"
}

/** Date du jour au format des colonnes `date` (AAAA-MM-JJ, fuseau local). */
export function todayIso() {
  return isoDate(new Date())
}

export function isoDate(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${value.getFullYear()}-${month}-${day}`
}

export function addDays(iso: string, days: number) {
  const value = new Date(`${iso}T00:00:00`)
  value.setDate(value.getDate() + days)
  return isoDate(value)
}

export function addYears(iso: string, years: number) {
  const value = new Date(`${iso}T00:00:00`)
  value.setFullYear(value.getFullYear() + years)
  return isoDate(value)
}
