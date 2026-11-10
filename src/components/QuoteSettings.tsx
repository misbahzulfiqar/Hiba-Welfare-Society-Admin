import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"
import { adminFetch } from "../lib/adminApi"
import { SaveActionButton, SaveSuccessBanner } from "./SaveActionButton"

type Quote = {
  id: string
  text: string
  detail: string
}

const EMPTY_DRAFT = { text: "", detail: "" }

export function QuoteSettings({ secret }: { secret: string }) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetch("/api/quotes")
      .then((res) => res.json())
      .then((data: { quotes?: Quote[] }) => {
        if (cancelled || !Array.isArray(data.quotes)) return
        setQuotes(data.quotes)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load quotes")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = async (next: Quote[], message: string) => {
    setBusy(true)
    setError("")
    const { ok, data } = await adminFetch("/api/admin/quotes", secret, {
      method: "PUT",
      body: JSON.stringify({ quotes: next }),
    })
    setBusy(false)
    if (!ok || !Array.isArray(data.quotes)) {
      setError(typeof data.error === "string" ? data.error : "Could not save quotes")
      return
    }
    setQuotes(data.quotes as Quote[])
    setSaved(message)
  }

  const startEdit = (quote: Quote) => {
    setEditingId(quote.id)
    setDraft({ text: quote.text, detail: quote.detail })
    setSaved("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
  }

  const addMore = () => {
    const text = draft.text.trim()
    if (!text) return
    const next = [...quotes, { id: crypto.randomUUID(), text, detail: draft.detail.trim() }]
    setDraft(EMPTY_DRAFT)
    setEditingId(null)
    void persist(next, "Quote added")
  }

  const saveQuote = () => {
    const text = draft.text.trim()
    const detail = draft.detail.trim()
    if (editingId && text) {
      const next = quotes.map((quote) => (quote.id === editingId ? { ...quote, text, detail } : quote))
      cancelEdit()
      void persist(next, "Saved")
      return
    }
    if (text) {
      const next = [...quotes, { id: crypto.randomUUID(), text, detail }]
      setDraft(EMPTY_DRAFT)
      setEditingId(null)
      void persist(next, next.length > 1 ? "Saved. The homepage now shows these quotes in a carousel." : "Saved")
      return
    }
    void persist(quotes, "Saved")
  }

  const removeQuote = (id: string) => {
    void persist(
      quotes.filter((quote) => quote.id !== id),
      "Quote removed",
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={saveQuote} />
      </div>
      <SaveSuccessBanner message={saved} />
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {quotes.length > 1 ? <AdminQuoteTrack quotes={quotes} /> : null}

      <div className="grid gap-3">
        {quotes.map((quote) => (
          <article key={quote.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{quote.text}</p>
            {quote.detail ? <p className="mt-1 text-sm text-slate-500">{quote.detail}</p> : null}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(quote)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeQuote(quote.id)}
                disabled={busy || quotes.length < 2}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">{editingId ? "Edit quote" : "Write a quote"}</h4>
        <p className="mt-1 text-sm text-slate-500">
          {editingId
            ? "Change the text, then save. Add more keeps this as a new quote instead."
            : "Two fields: the quote, and a short detail such as the source."}
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quote</span>
          <textarea
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</span>
          <input
            value={draft.detail}
            onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={saveQuote} />
          <button
            type="button"
            disabled={busy || !draft.text.trim()}
            onClick={addMore}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add more
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600">
              Cancel
            </button>
          ) : null}
        </div>
        {quotes.length < 2 ? (
          <p className="mt-3 text-xs text-slate-500">Add a second quote and the homepage shows them as a carousel.</p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">Each quote stays for a few seconds, then eases to the next over one second. Use the buttons to move it yourself.</p>
        )}
      </div>
    </div>
  )
}

function AdminQuoteTrack({ quotes }: { quotes: Quote[] }) {
  const count = quotes.length
  const [position, setPosition] = useState(0)
  const [motion, setMotion] = useState(true)
  const [tick, setTick] = useState(0)
  const positionRef = useRef(0)
  positionRef.current = position
  const slides = [quotes[count - 1], ...quotes, quotes[0]]

  useEffect(() => {
    setPosition(0)
    setMotion(true)
  }, [count])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMotion(true)
      setPosition((current) => (current >= 0 && current < count ? current + 1 : current))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [count, tick])

  useEffect(() => {
    if (position >= 0 && position < count) return
    const timer = window.setTimeout(() => {
      setMotion(false)
      setPosition(position >= count ? 0 : count - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [position, count])

  useEffect(() => {
    if (motion) return
    let second = 0
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setMotion(true))
    })
    return () => {
      window.cancelAnimationFrame(first)
      window.cancelAnimationFrame(second)
    }
  }, [motion])

  const step = (direction: 1 | -1) => {
    const current = positionRef.current
    setTick((value) => value + 1)
    if (current >= count || current < 0) {
      setMotion(false)
      setPosition(current >= count ? 0 : count - 1)
      return
    }
    setMotion(true)
    setPosition(current + direction)
  }

  const settleLoop = () => {
    if (position >= count) {
      setMotion(false)
      setPosition(0)
      return
    }
    if (position < 0) {
      setMotion(false)
      setPosition(count - 1)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#003B73] px-14 py-8 text-center text-white">
      <button
        type="button"
        aria-label="Previous quote"
        onClick={() => step(-1)}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 hover:bg-white/25"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="overflow-hidden">
        <div
          className="flex"
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== "transform") return
            settleLoop()
          }}
          style={{
            transform: `translateX(-${(position + 1) * 100}%)`,
            transition: motion ? "transform 1000ms ease-in-out" : "none",
          }}
        >
          {slides.map((item, itemIndex) => (
            <div key={`${item.id}-${itemIndex}`} className="w-full shrink-0">
              <p className="text-lg font-medium leading-snug">{item.text}</p>
              <p className={`mt-2 text-sm ${item.detail ? "text-white/80" : "invisible"}`}>— ({item.detail || "source"})</p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Next quote"
        onClick={() => step(1)}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-2 hover:bg-white/25"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
