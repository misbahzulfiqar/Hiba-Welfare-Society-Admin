import { Check, Save } from "lucide-react"

export function SaveActionButton({
  busy = false,
  saved = false,
  onClick,
  label = "Save",
  savedLabel = "Saved",
}: {
  busy?: boolean
  saved?: boolean
  onClick: () => void
  label?: string
  savedLabel?: string
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
        saved ? "bg-emerald-700 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {busy ? "Saving…" : saved ? savedLabel : label}
    </button>
  )
}

export function SaveSuccessBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
  )
}
