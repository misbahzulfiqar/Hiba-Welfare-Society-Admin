export const ADMIN_SECRET_KEY = "hiba_admin_token"

export function getApiBase(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined
  if (env && env.trim()) return env.replace(/\/$/, "")
  return ""
}

export async function adminFetch(
  path: string,
  secret: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data: Record<string, unknown>; status: number }> {
  const base = getApiBase()
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": secret,
      Authorization: `Bearer ${secret}`,
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { ok: res.ok, data, status: res.status }
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const base = getApiBase()
  try {
    const res = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; token?: string; error?: string }
    if (!res.ok || !data.token) {
      return { ok: false, error: data.error ?? "Invalid email or password" }
    }
    return { ok: true, token: data.token }
  } catch {
    return { ok: false, error: "Cannot reach API. Run: npm run dev:server" }
  }
}

export function formatPkr(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case "pending_verification":
      return "Pending"
    case "under_review":
      return "Under review"
    case "more_info_required":
      return "More info requested"
    case "success":
      return "Approved"
    case "failed":
      return "Rejected"
    case "cancelled":
      return "Cancelled"
    case "bank_transfer_initiated":
      return "Awaiting transfer"
    default:
      return status
  }
}

export function statusClass(status: string): string {
  switch (status) {
    case "pending_verification":
    case "under_review":
    case "more_info_required":
    case "bank_transfer_initiated":
      return "bg-amber-100 text-amber-800"
    case "success":
      return "bg-emerald-100 text-emerald-800"
    case "failed":
      return "bg-red-100 text-red-800"
    case "cancelled":
      return "bg-slate-200 text-slate-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}
