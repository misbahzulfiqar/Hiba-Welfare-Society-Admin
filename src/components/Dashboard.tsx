import { useMemo } from "react"
import {
  CheckCircle2,
  Clock3,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { formatPkr, statusClass, statusLabel } from "../lib/adminApi"
import type { AdminStats, PaymentRow } from "../lib/types"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

const CATEGORY_COLORS = [
  "from-emerald-500 to-teal-400",
  "from-sky-500 to-blue-400",
  "from-violet-500 to-indigo-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-cyan-500 to-emerald-400",
] as const

type DashboardProps = {
  stats: AdminStats
  lastUpdated: Date | null
  onOpenDonation: (orderRef: string) => void
}

function monthLabel(key: string) {
  const [year, month] = key.split("-")
  const monthIndex = Number(month) - 1
  if (!year || monthIndex < 0 || monthIndex > 11) return key
  return `${MONTH_NAMES[monthIndex]} ${year.slice(-2)}`
}

function lastMonths(byMonth: Record<string, number>, count: number) {
  const now = new Date()
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return keys.map((key) => ({ key, value: byMonth[key] ?? 0 }))
}

export function Dashboard({ stats, lastUpdated, onOpenDonation }: DashboardProps) {
  const monthBars = useMemo(() => {
    const entries = lastMonths(stats.byMonth, 8)
    const max = Math.max(1, ...entries.map((entry) => entry.value))
    return entries.map((entry) => ({
      ...entry,
      label: monthLabel(entry.key),
      pct: Math.round((entry.value / max) * 100),
    }))
  }, [stats.byMonth])

  const categoryBars = useMemo(() => {
    const entries = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...entries.map(([, value]) => value))
    const total = entries.reduce((sum, [, value]) => sum + value, 0)
    return entries.map(([name, value], index) => ({
      name,
      value,
      pct: Math.round((value / max) * 100),
      share: total ? Math.round((value / total) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
  }, [stats.byCategory])

  const pipelineTotal = Math.max(1, stats.pendingAmount + stats.approvedAmount + stats.rejectedAmount)
  const pipeline = [
    { label: "Pending", value: stats.pendingAmount, count: stats.pendingCount, color: "bg-amber-400", width: (stats.pendingAmount / pipelineTotal) * 100 },
    { label: "Approved", value: stats.approvedAmount, count: stats.approvedCount, color: "bg-emerald-500", width: (stats.approvedAmount / pipelineTotal) * 100 },
    { label: "Rejected", value: stats.rejectedAmount, count: stats.rejectedCount, color: "bg-rose-400", width: (stats.rejectedAmount / pipelineTotal) * 100 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Live overview</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Donation dashboard</h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
          {lastUpdated ? (
            <span className="font-medium text-emerald-700/80">
              · {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total donations"
          value={formatPkr(stats.totalAmount)}
          hint={`${stats.totalCount} records`}
          icon={Wallet}
          tone="emerald"
        />
        <MetricCard
          label="Pending verification"
          value={formatPkr(stats.pendingAmount)}
          hint={`${stats.pendingCount} waiting`}
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Approved / received"
          value={formatPkr(stats.approvedAmount)}
          hint={`${stats.approvedCount} confirmed`}
          icon={CheckCircle2}
          tone="sky"
        />
        <MetricCard
          label="Rejected"
          value={formatPkr(stats.rejectedAmount)}
          hint={`${stats.rejectedCount} declined`}
          icon={XCircle}
          tone="rose"
        />
        <MetricCard label="Today" value={formatPkr(stats.todayAmount)} icon={TrendingUp} tone="violet" />
        <MetricCard label="This month" value={formatPkr(stats.monthAmount)} icon={TrendingUp} tone="teal" />
        <MetricCard label="This year" value={formatPkr(stats.yearAmount)} icon={Wallet} tone="indigo" />
        <MetricCard label="Donors" value={String(stats.donorCount)} icon={Users} tone="cyan" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Live donation pipeline</h4>
            <p className="mt-0.5 text-xs text-slate-500">Pending, approved, and rejected amounts</p>
          </div>
        </div>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-slate-100">
          {pipeline.map((item) => (
            <div
              key={item.label}
              className={`${item.color} transition-all duration-700`}
              style={{ width: `${item.width}%` }}
              title={`${item.label}: ${formatPkr(item.value)}`}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{formatPkr(item.value)}</p>
              <p className="text-xs text-slate-500">{item.count} donations</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Approved by month</h4>
              <p className="mt-0.5 text-xs text-slate-500">Live bar chart of confirmed donations</p>
            </div>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3">
            {monthBars.map((bar) => (
              <div key={bar.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-2 text-[10px] font-semibold text-slate-500">
                  {bar.value ? formatPkr(bar.value) : "—"}
                </span>
                <div className="relative flex h-full w-full items-end justify-center">
                  <div
                    className="w-8 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm transition-all duration-700 sm:w-10"
                    style={{ height: `${Math.max(bar.pct, bar.value ? 8 : 3)}%` }}
                  />
                </div>
                <span className="mt-2 text-[11px] font-medium text-slate-600">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900">Approved by category</h4>
          <p className="mt-0.5 text-xs text-slate-500">Share of confirmed donation amounts</p>
          <div className="mt-5 space-y-4">
            {categoryBars.length === 0 ? (
              <p className="text-sm text-slate-500">No category totals yet.</p>
            ) : (
              categoryBars.map((bar) => (
                <div key={bar.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-800">{bar.name}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatPkr(bar.value)} · {bar.share}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${bar.color} transition-all duration-700`}
                      style={{ width: `${Math.max(bar.pct, 6)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">Recent donations</h4>
        <div className="mt-4 divide-y divide-slate-100">
          {stats.recent.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No donations yet.</p>
          ) : (
            stats.recent.map((row) => (
              <RecentRow key={row.orderRef} row={row} onOpen={() => onOpenDonation(row.orderRef)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RecentRow({ row, onOpen }: { row: PaymentRow; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{row.donorName || "Donor"}</p>
        <p className="truncate font-mono text-[11px] text-slate-500">{row.orderRef}</p>
      </div>
      <p className="shrink-0 text-sm font-bold text-slate-900">{formatPkr(row.amountPkr)}</p>
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClass(row.status)}`}>
        {statusLabel(row.status)}
      </span>
    </button>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Wallet
  tone: "emerald" | "amber" | "sky" | "rose" | "violet" | "teal" | "indigo" | "cyan"
}) {
  const tones = {
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-400",
    sky: "from-sky-500 to-blue-500",
    rose: "from-rose-500 to-pink-500",
    violet: "from-violet-500 to-purple-500",
    teal: "from-teal-500 to-emerald-500",
    indigo: "from-indigo-500 to-blue-500",
    cyan: "from-cyan-500 to-sky-500",
  } as const

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 bg-gradient-to-r ${tones[tone]}`} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <span className={`rounded-lg bg-gradient-to-br ${tones[tone]} p-1.5 text-white`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}
