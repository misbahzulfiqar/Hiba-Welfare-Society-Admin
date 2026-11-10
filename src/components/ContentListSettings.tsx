import { useEffect, useState } from "react"
import type {
  DonateCtaSettings,
  NewsletterBannerSettings,
  StoryItem,
  StorySection,
  TestimonialItem,
  TestimonialsSection,
} from "../../../server/src/homepageContent"
import { adminFetch } from "../lib/adminApi"
import { SaveActionButton } from "./SaveActionButton"

type HomepageRecord = {
  blogs: StorySection
  mediaUpdates: StorySection
  latestNews: StorySection
  testimonials: TestimonialsSection
  donateCta: DonateCtaSettings
  newsletterBanner: NewsletterBannerSettings
} & Record<string, unknown>

type StoryKey = "blogs" | "mediaUpdates" | "latestNews"

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`
}

function useHomepageRecord(secret: string) {
  const [homepage, setHomepageState] = useState<HomepageRecord | null>(null)
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const setHomepage = (next: HomepageRecord | ((current: HomepageRecord) => HomepageRecord)) => {
    setSaved("")
    setHomepageState((current) => {
      if (!current) return current
      return typeof next === "function" ? next(current) : next
    })
  }

  useEffect(() => {
    let cancelled = false
    void fetch("/api/homepage")
      .then((res) => res.json())
      .then((data: { homepage?: HomepageRecord }) => {
        if (cancelled || !data.homepage) return
        setHomepageState(data.homepage)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load homepage settings")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (next: HomepageRecord, message: string) => {
    setBusy(true)
    setError("")
    const { ok, data } = await adminFetch("/api/admin/homepage", secret, {
      method: "PUT",
      body: JSON.stringify({ homepage: next }),
    })
    setBusy(false)
    const savedHomepage = data.homepage
    if (!ok || !savedHomepage || typeof savedHomepage !== "object") {
      setError(typeof data.error === "string" ? data.error : "Could not save")
      return
    }
    setHomepageState(savedHomepage as HomepageRecord)
    setSaved(message)
  }

  return { homepage, setHomepage, save, saved, error, busy }
}

async function uploadImage(secret: string, cardId: string, file: File): Promise<string> {
  const res = await fetch(`/api/admin/uploads?card=${encodeURIComponent(cardId)}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-admin-secret": secret,
      Authorization: `Bearer ${secret}`,
    },
    body: file,
  })
  const data = (await res.json().catch(() => ({}))) as { image?: string; error?: string }
  if (!res.ok || typeof data.image !== "string") throw new Error(data.error || "Could not upload image")
  return data.image
}

function Status({ saved, error }: { saved: string; error: string }) {
  return (
    <>
      {saved ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{saved}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </>
  )
}

function VisibilityToggle({ shown, onChange }: { shown: boolean; onChange: (shown: boolean) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Show on the website</p>
      <p className="mt-1 text-sm text-slate-500">
        {shown ? "This section is visible on the homepage." : "This section is hidden on the homepage."}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${shown ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"}`}
        >
          Show
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${shown ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"}`}
        >
          Hide
        </button>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const className = "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {multiline ? (
        <textarea value={value} rows={4} onChange={(e) => onChange(e.target.value)} className={className} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </label>
  )
}

function ImageField({
  secret,
  cardId,
  image,
  onChange,
}: {
  secret: string
  cardId: string
  image: string
  onChange: (image: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  return (
    <div>
      <label className="block cursor-pointer overflow-hidden rounded-xl bg-slate-100">
        <div className="relative aspect-[4/3]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">Click to upload an image</div>
          )}
          {uploading ? <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">Uploading…</div> : null}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (!file) return
            if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
              setError("Choose an image under 5 MB")
              return
            }
            setUploading(true)
            setError("")
            void uploadImage(secret, cardId, file)
              .then(onChange)
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not upload image"))
              .finally(() => setUploading(false))
          }}
        />
      </label>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : <p className="mt-2 text-xs text-slate-500">Click the image to replace it, then press Save.</p>}
    </div>
  )
}

function StorySettings({
  secret,
  sectionKey,
  noun,
}: {
  secret: string
  sectionKey: StoryKey
  noun: string
}) {
  const { homepage, setHomepage, save, saved, error, busy } = useHomepageRecord(secret)
  if (!homepage) {
    return <p className="text-sm text-slate-500">{error || "Loading…"}</p>
  }
  const section = homepage[sectionKey]
  const updateSection = (patch: Partial<StorySection>) => {
    setHomepage((current) => ({ ...current, [sectionKey]: { ...current[sectionKey], ...patch } }))
  }
  const updateItem = (id: string, patch: Partial<StoryItem>) => {
    updateSection({
      items: section.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle shown={section.visible} onChange={(visible) => updateSection({ visible })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <TextField label="Small heading" value={section.eyebrow} onChange={(eyebrow) => updateSection({ eyebrow })} />
        <TextField label="Title start" value={section.titleLead} onChange={(titleLead) => updateSection({ titleLead })} />
        <TextField label="Title highlight" value={section.titleAccent} onChange={(titleAccent) => updateSection({ titleAccent })} />
        <TextField label="Description" value={section.description} multiline onChange={(description) => updateSection({ description })} />
      </div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">{section.items.length} {noun}{section.items.length === 1 ? "" : "s"}</h4>
        <button
          type="button"
          onClick={() =>
            updateSection({
              items: [
                ...section.items,
                { id: newId(noun), image: "", date: "", title: `New ${noun}`, excerpt: "", visible: true },
              ],
            })
          }
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Add {noun}
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {section.items.map((item, index) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">{noun} {index + 1}</h4>
              <button
                type="button"
                onClick={() => updateSection({ items: section.items.filter((entry) => entry.id !== item.id) })}
                className="text-xs font-semibold text-red-600"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => updateItem(item.id, { visible: true })} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${item.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"}`}>Show</button>
              <button type="button" onClick={() => updateItem(item.id, { visible: false })} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${item.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"}`}>Hide</button>
            </div>
            <div className="mt-3">
              <ImageField secret={secret} cardId={item.id} image={item.image} onChange={(image) => updateItem(item.id, { image })} />
            </div>
            <div className="mt-3 space-y-3">
              <TextField label="Date" value={item.date} onChange={(date) => updateItem(item.id, { date })} />
              <TextField label="Title" value={item.title} onChange={(title) => updateItem(item.id, { title })} />
              <TextField label="Excerpt" value={item.excerpt} multiline onChange={(excerpt) => updateItem(item.id, { excerpt })} />
            </div>
          </article>
        ))}
      </div>
      <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={() => void save(homepage, "Saved")} />
    </div>
  )
}

export function BlogsSettings({ secret }: { secret: string }) {
  return <StorySettings secret={secret} sectionKey="blogs" noun="blog" />
}

export function MediaUpdatesSettings({ secret }: { secret: string }) {
  return <StorySettings secret={secret} sectionKey="mediaUpdates" noun="update" />
}

export function LatestNewsSettings({ secret }: { secret: string }) {
  return <StorySettings secret={secret} sectionKey="latestNews" noun="news item" />
}

export function TestimonialsSettings({ secret }: { secret: string }) {
  const { homepage, setHomepage, save, saved, error, busy } = useHomepageRecord(secret)
  if (!homepage) return <p className="text-sm text-slate-500">{error || "Loading…"}</p>
  const section = homepage.testimonials
  const updateSection = (patch: Partial<TestimonialsSection>) => {
    setHomepage((current) => ({ ...current, testimonials: { ...current.testimonials, ...patch } }))
  }
  const updateItem = (id: string, patch: Partial<TestimonialItem>) => {
    updateSection({ items: section.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle shown={section.visible} onChange={(visible) => updateSection({ visible })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <TextField label="Badge" value={section.badge} onChange={(badge) => updateSection({ badge })} />
        <TextField label="Title start" value={section.titleLead} onChange={(titleLead) => updateSection({ titleLead })} />
        <TextField label="Title highlight" value={section.titleAccent} onChange={(titleAccent) => updateSection({ titleAccent })} />
        <TextField label="Description" value={section.description} multiline onChange={(description) => updateSection({ description })} />
      </div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900">{section.items.length} testimonials</h4>
        <button
          type="button"
          onClick={() =>
            updateSection({
              items: [
                ...section.items,
                { id: newId("testimonial"), name: "New name", role: "", quote: "New quote", time: "", avatar: "", rating: 5, visible: true },
              ],
            })
          }
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Add testimonial
        </button>
      </div>
      <div className="grid gap-4">
        {section.items.map((item, index) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Testimonial {index + 1}</h4>
              <button type="button" onClick={() => updateSection({ items: section.items.filter((entry) => entry.id !== item.id) })} className="text-xs font-semibold text-red-600">Remove</button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <ImageField secret={secret} cardId={item.id} image={item.avatar} onChange={(avatar) => updateItem(item.id, { avatar })} />
              <div className="space-y-3">
                <TextField label="Name" value={item.name} onChange={(name) => updateItem(item.id, { name })} />
                <TextField label="Role" value={item.role} onChange={(role) => updateItem(item.id, { role })} />
                <TextField label="Time" value={item.time} onChange={(time) => updateItem(item.id, { time })} />
                <TextField label="Rating (0-5)" value={String(item.rating)} onChange={(value) => updateItem(item.id, { rating: Number(value) || 0 })} />
              </div>
            </div>
            <div className="mt-3">
              <TextField label="Quote" value={item.quote} multiline onChange={(quote) => updateItem(item.id, { quote })} />
            </div>
          </article>
        ))}
      </div>
      <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={() => void save(homepage, "Testimonials saved")} />
    </div>
  )
}

export function DonateCtaSettings({ secret }: { secret: string }) {
  const { homepage, setHomepage, save, saved, error, busy } = useHomepageRecord(secret)
  if (!homepage) return <p className="text-sm text-slate-500">{error || "Loading…"}</p>
  const section = homepage.donateCta
  const update = (patch: Partial<DonateCtaSettings>) => {
    setHomepage((current) => ({ ...current, donateCta: { ...current.donateCta, ...patch } }))
  }
  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle shown={section.visible} onChange={(visible) => update({ visible })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <TextField label="Heading" value={section.title} onChange={(title) => update({ title })} />
        <TextField label="Description" value={section.description} multiline onChange={(description) => update({ description })} />
        <TextField label="Button label" value={section.buttonLabel} onChange={(buttonLabel) => update({ buttonLabel })} />
      </div>
      <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={() => void save(homepage, "Donation banner saved")} />
    </div>
  )
}

export function NewsletterBannerSettings({ secret }: { secret: string }) {
  const { homepage, setHomepage, save, saved, error, busy } = useHomepageRecord(secret)
  if (!homepage) return <p className="text-sm text-slate-500">{error || "Loading…"}</p>
  const section = homepage.newsletterBanner
  const update = (patch: Partial<NewsletterBannerSettings>) => {
    setHomepage((current) => ({ ...current, newsletterBanner: { ...current.newsletterBanner, ...patch } }))
  }
  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle shown={section.visible} onChange={(visible) => update({ visible })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <TextField label="Heading" value={section.title} onChange={(title) => update({ title })} />
        <TextField label="Description" value={section.description} multiline onChange={(description) => update({ description })} />
      </div>
      <SaveActionButton busy={busy} saved={Boolean(saved)} onClick={() => void save(homepage, "Newsletter banner saved")} />
    </div>
  )
}
