import { useCallback, useEffect, useState } from "react"
import {
  Ban,
  Banknote,
  BarChart3,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  Globe,
  HeartHandshake,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react"
import { Dashboard } from "./components/Dashboard"
import { SiteSettings } from "./components/SiteSettings"
import { ADMIN_SECRET_KEY, adminFetch, adminLogin, formatPkr, formatWhen, statusClass, statusLabel } from "./lib/adminApi"
import type { AdminStats, DonorRow, NavId, PaymentRow } from "./lib/types"

const NAV: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "donations", label: "Donations", icon: HeartHandshake },
  { id: "donors", label: "Donors", icon: Users },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "programs", label: "Programs", icon: Megaphone },
  { id: "campaigns", label: "Campaigns", icon: BarChart3 },
  { id: "payments", label: "Bank / Payments", icon: Banknote },
  { id: "beneficiaries", label: "Beneficiaries", icon: HeartHandshake },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "content", label: "Website Content", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "users", label: "Admin Users", icon: Shield },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "site-settings", label: "Site settings", icon: Globe },
  { id: "settings", label: "Settings", icon: Settings },
]

const DONATION_FILTERS = [
  ["all", "All"],
  ["pending_verification", "Pending"],
  ["under_review", "Under review"],
  ["success", "Approved"],
  ["failed", "Rejected"],
  ["cancelled", "Cancelled"],
  ["bank_transfer_initiated", "Awaiting transfer"],
] as const

const REJECTION_OPTIONS = [
  ["payment_proof_invalid", "Payment proof invalid"],
  ["transaction_not_found", "Transaction not found"],
  ["wrong_amount", "Wrong amount"],
  ["duplicate_transaction", "Duplicate transaction"],
  ["bank_transfer_not_received", "Bank transfer not received"],
  ["payment_not_received", "Payment not received"],
  ["invalid_transaction", "Invalid transaction"],
  ["duplicate_payment", "Duplicate payment"],
  ["incorrect_information", "Incorrect information"],
  ["other", "Other"],
] as const

function LoginScreen({ onLogin }: { onLogin: (secret: string) => void }) {
  const [email, setEmail] = useState("Fayyaz@gmail.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await adminLogin(email.trim(), password)
    setLoading(false)
    if (!result.ok || !result.token) {
      setError(result.error ?? "Invalid email or password")
      return
    }
    onLogin(result.token)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] px-4">
      <form onSubmit={(e) => void handleSubmit(e)} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Hiba Welfare Society</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in with your admin email and password.</p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          autoComplete="username"
          placeholder="Fayyaz@gmail.com"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            autoComplete="current-password"
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  )
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{body}</p>
    </div>
  )
}

function AdminShell({ secret, onLogout }: { secret: string; onLogout: () => void }) {
  const [nav, setNav] = useState<NavId>("dashboard")
  const [donationFilter, setDonationFilter] = useState<string>("pending_verification")
  const [search, setSearch] = useState("")
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null)
  const [donors, setDonors] = useState<DonorRow[]>([])
  const [selected, setSelected] = useState<PaymentRow | null>(null)
  const [donorEmail, setDonorEmail] = useState<string | null>(null)
  const [donorDonations, setDonorDonations] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reasonCode, setReasonCode] = useState("bank_transfer_not_received")
  const [adminNote, setAdminNote] = useState("")
  const [audit, setAudit] = useState<Array<Record<string, unknown>>>([])

  const loadStats = useCallback(async () => {
    const { ok, data } = await adminFetch("/api/admin/stats", secret)
    if (ok && data.stats && typeof data.stats === "object") {
      setStats(data.stats as AdminStats)
      setStatsUpdatedAt(new Date())
    }
  }, [secret])

  const loadPayments = useCallback(async () => {
    setLoading(true)
    setError("")
    const q = search.trim() ? `&q=${encodeURIComponent(search.trim())}` : ""
    const { ok, data } = await adminFetch(
      `/api/admin/payments?status=${encodeURIComponent(donationFilter)}&limit=200${q}`,
      secret,
    )
    if (!ok) {
      setError(typeof data.error === "string" ? data.error : "Failed to load donations")
      setLoading(false)
      return
    }
    setPayments(Array.isArray(data.payments) ? (data.payments as PaymentRow[]) : [])
    setLoading(false)
  }, [donationFilter, search, secret])

  const loadDonors = useCallback(async () => {
    const { ok, data } = await adminFetch("/api/admin/donors", secret)
    if (ok && Array.isArray(data.donors)) setDonors(data.donors as DonorRow[])
  }, [secret])

  const loadAudit = useCallback(async () => {
    const { ok, data } = await adminFetch("/api/admin/audit", secret)
    if (ok && Array.isArray(data.events)) setAudit(data.events as Array<Record<string, unknown>>)
  }, [secret])

  useEffect(() => {
    void loadStats()
    void loadDonors()
    void loadAudit()
  }, [loadAudit, loadDonors, loadStats])

  useEffect(() => {
    if (nav !== "dashboard") return
    const timer = window.setInterval(() => {
      void loadStats()
    }, 15000)
    return () => window.clearInterval(timer)
  }, [loadStats, nav])

  useEffect(() => {
    if (nav === "donations" || nav === "dashboard") void loadPayments()
  }, [loadPayments, nav])

  const openDonation = async (orderRef: string) => {
    const { ok, data } = await adminFetch(`/api/admin/payments/${encodeURIComponent(orderRef)}`, secret)
    if (ok && data.payment) {
      setSelected(data.payment as PaymentRow)
      setRejectOpen(false)
      setAdminNote("")
    }
  }

  const openDonor = async (email: string) => {
    setDonorEmail(email)
    const { ok, data } = await adminFetch(`/api/admin/donors/${encodeURIComponent(email)}`, secret)
    setDonorDonations(ok && Array.isArray(data.donations) ? (data.donations as PaymentRow[]) : [])
  }

  const act = async (orderRef: string, action: "approve" | "reject" | "review" | "request-info") => {
    setBusy(true)
    setMessage("")
    const body =
      action === "reject"
        ? { reasonCode, adminNote, adminName: "Admin" }
        : action === "approve"
          ? { adminNote: adminNote || "Bank transaction verified successfully.", adminName: "Admin" }
          : action === "request-info"
            ? { message: adminNote || "Please send a clearer payment receipt or transaction ID." }
            : {}
    const { ok, data } = await adminFetch(`/api/admin/payments/${encodeURIComponent(orderRef)}/${action}`, secret, {
      method: "POST",
      body: JSON.stringify(body),
    })
    setBusy(false)
    if (!ok) {
      setError(typeof data.error === "string" ? data.error : `Could not ${action}`)
      return
    }
    setMessage(action === "approve" ? "Donation approved" : action === "reject" ? "Donation rejected" : "Updated")
    setSelected(data.payment ? (data.payment as PaymentRow) : null)
    setRejectOpen(false)
    await Promise.all([loadPayments(), loadStats(), loadDonors(), loadAudit()])
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F9] text-slate-800">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-100 px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Hiba Welfare</p>
          <h1 className="mt-1 text-lg font-bold text-slate-900">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = nav === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setNav(item.id)
                  setSelected(null)
                  setDonorEmail(null)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{NAV.find((n) => n.id === nav)?.label}</h2>
            <p className="text-xs text-slate-500">
              {nav === "site-settings"
                ? "Home, about, services, media, contact and bank details"
                : "Donor → Pending → Review → Approved / Rejected"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void Promise.all([loadPayments(), loadStats(), loadDonors(), loadAudit()])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {message ? <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
          {error ? <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          {nav === "dashboard" ? (
            stats ? (
              <Dashboard
                stats={stats}
                lastUpdated={statsUpdatedAt}
                onOpenDonation={(orderRef) => {
                  setNav("donations")
                  void openDonation(orderRef)
                }}
              />
            ) : (
              <div className="flex items-center gap-2 py-16 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading live dashboard…
              </div>
            )
          ) : null}

          {nav === "donations" ? (
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {DONATION_FILTERS.map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDonationFilter(id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        donationFilter === id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ID, donor, email, phone, transaction ID"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 py-10 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading donations…
                  </div>
                ) : payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
                    No donations in this filter.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Donor</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.orderRef} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-mono text-xs">{p.orderRef}</td>
                            <td className="px-3 py-2">
                              <div>{p.donorName || "—"}</div>
                              <div className="text-xs text-slate-500">{p.donorEmail || p.donorPhone}</div>
                            </td>
                            <td className="px-3 py-2 font-medium">{formatPkr(p.amountPkr)}</td>
                            <td className="px-3 py-2">{p.category}</td>
                            <td className="px-3 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(p.status)}`}>
                                {statusLabel(p.status)}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <button type="button" className="text-xs font-semibold text-emerald-700" onClick={() => void openDonation(p.orderRef)}>
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                {selected ? (
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-slate-500">{selected.orderRef}</p>
                        <h3 className="mt-1 text-xl font-bold">{formatPkr(selected.amountPkr)}</h3>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(selected.status)}`}>
                          {statusLabel(selected.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <p><span className="text-slate-400">Donor:</span> {selected.donorName || "—"}</p>
                      <p><span className="text-slate-400">Email:</span> {selected.donorEmail || "—"}</p>
                      <p><span className="text-slate-400">Phone:</span> {selected.donorPhone || selected.senderPhone || "—"}</p>
                      <p><span className="text-slate-400">Category:</span> {selected.category}</p>
                      <p><span className="text-slate-400">Payment:</span> {selected.gateway || "Bank transfer"}</p>
                      <p><span className="text-slate-400">Transaction ID:</span> {selected.transactionId || "—"}</p>
                      <p><span className="text-slate-400">Submitted:</span> {formatWhen(selected.submittedAt)}</p>
                      {selected.notes ? <p><span className="text-slate-400">Notes:</span> {selected.notes}</p> : null}
                      {selected.rejectionReason ? <p className="text-red-700"><span className="text-slate-400">Rejection:</span> {selected.rejectionReason}</p> : null}
                      {selected.approvedBy ? <p><span className="text-slate-400">Approved by:</span> {selected.approvedBy} {formatWhen(selected.verifiedAt)}</p> : null}
                      {selected.infoRequest ? <p className="text-amber-700">{selected.infoRequest}</p> : null}
                    </div>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Verification note / extra details"
                      className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      rows={3}
                    />
                    {rejectOpen ? (
                      <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-semibold uppercase text-red-700">Reason for rejection</p>
                        <div className="mt-2 space-y-1">
                          {REJECTION_OPTIONS.map(([code, label]) => (
                            <label key={code} className="flex items-center gap-2 text-sm">
                              <input type="radio" name="reason" checked={reasonCode === code} onChange={() => setReasonCode(code)} />
                              {label}
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void act(selected.orderRef, "reject")}
                          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                        >
                          <Ban className="h-4 w-4" /> Confirm rejection
                        </button>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(selected.orderRef, "approve")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setRejectOpen(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(selected.orderRef, "review")}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                      >
                        Mark under review
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void act(selected.orderRef, "request-info")}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                      >
                        Request more information
                      </button>
                    </div>
                  </article>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
                    Select a donation to view full details. Donors only see their own records.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {nav === "donors" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Donor</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Approved</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((d) => (
                      <tr key={d.email || d.name} className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          <div className="font-medium">{d.name || "—"}</div>
                          <div className="text-xs text-slate-500">{d.email}</div>
                        </td>
                        <td className="px-3 py-2">{d.totalCount} / {formatPkr(d.totalAmount)}</td>
                        <td className="px-3 py-2">{formatPkr(d.approvedAmount)}</td>
                        <td className="px-3 py-2">
                          {d.email ? (
                            <button type="button" className="text-xs font-semibold text-emerald-700" onClick={() => void openDonor(d.email)}>
                              View
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                {donorEmail ? (
                  <>
                    <h3 className="text-lg font-semibold">{donorEmail}</h3>
                    <p className="mt-1 text-sm text-slate-500">Only this donor&apos;s donations are listed here.</p>
                    <div className="mt-4 space-y-2">
                      {donorDonations.map((p) => (
                        <button
                          key={p.orderRef}
                          type="button"
                          onClick={() => {
                            setNav("donations")
                            void openDonation(p.orderRef)
                          }}
                          className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-mono text-xs">{p.orderRef}</span>
                          <span>{formatPkr(p.amountPkr)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(p.status)}`}>
                            {statusLabel(p.status)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Select a donor to see their donation history.</p>
                )}
              </div>
            </div>
          ) : null}

          {nav === "audit" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              {audit.length === 0 ? <p className="text-sm text-slate-500">No admin actions recorded yet in this session.</p> : null}
              <div className="space-y-2">
                {audit.map((e, i) => (
                  <div key={`${String(e.at)}-${i}`} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium">{String(e.action)}</span> · {String(e.orderRef ?? "")} · {String(e.at ?? "")}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {nav === "categories" ? (
            <Placeholder title="Donation categories" body="Manage Health, Education, Food, Welfare and other causes from here in a later phase. Donate pages already use the current website catalog." />
          ) : null}
          {nav === "programs" ? (
            <Placeholder title="Welfare programs" body="Create and feature programs such as Blood Bank, Schooling System, and Roti Bank without changing the live website yet." />
          ) : null}
          {nav === "campaigns" ? (
            <Placeholder title="Campaigns" body="Ramzan, flood relief and seasonal campaigns can be added here with targets and dates." />
          ) : null}
          {nav === "payments" ? (
            <Placeholder title="Bank accounts / payment methods" body="The live site currently uses the Faysal Bank account on the Bank Details page. Admin editing can be enabled next." />
          ) : null}
          {nav === "beneficiaries" ? (
            <Placeholder title="Beneficiaries" body="Track people who receive assistance separately from donors." />
          ) : null}
          {nav === "reports" ? (
            <Placeholder title="Reports" body="Use the dashboard totals for now. CSV/PDF export can be added next." />
          ) : null}
          {nav === "content" ? (
            <Placeholder title="Website content" body="Homepage, about and media stay on the public site for now so existing pages are unchanged." />
          ) : null}
          {nav === "notifications" ? (
            <Placeholder title="Notifications" body="Donors already see Pending, Approved, Rejected and the rejection reason in their account." />
          ) : null}
          {nav === "users" ? (
            <Placeholder title="Admin users & roles" body="This panel currently uses the shared ADMIN_SECRET. Role-based users can be added next." />
          ) : null}
          {nav === "site-settings" ? <SiteSettings secret={secret} /> : null}
          {nav === "settings" ? (
            <Placeholder title="Settings" body="Organization name, currency (PKR) and notification options will live here." />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function App() {
  const [secret, setSecret] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SECRET_KEY)
    } catch {
      return null
    }
  })

  const handleLogin = (s: string) => {
    sessionStorage.setItem(ADMIN_SECRET_KEY, s)
    setSecret(s)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SECRET_KEY)
    setSecret(null)
  }

  if (!secret) return <LoginScreen onLogin={handleLogin} />
  return <AdminShell secret={secret} onLogout={handleLogout} />
}

export default App
