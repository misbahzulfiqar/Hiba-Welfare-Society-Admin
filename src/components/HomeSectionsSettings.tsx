import { useEffect, useState } from "react"
import { adminFetch } from "../lib/adminApi"
import { SaveActionButton } from "./SaveActionButton"

type InitiativeCard = {
  id: string
  title: string
  description: string
  image: string
  overlay: string
  link: string
}

type QuickDonateOption = {
  id: string
  label: string
  link: string
  visible: boolean
}

type QuickDonateCard = {
  id: "quick-left" | "quick-right"
  title: string
  description: string
  image: string
  badge: string
  priceTitle: string
  visible: boolean
}

type QuickDonateSettings = {
  visible: boolean
  options: QuickDonateOption[]
  cards: QuickDonateCard[]
}

type ImpactCard = {
  id: "lives" | "food" | "family" | "students"
  value: string
  label: string
  visible: boolean
}

type ImpactSettingsData = {
  visible: boolean
  cards: ImpactCard[]
}

type WhatWeAreDoingTab = {
  id: string
  label: string
  visible: boolean
}

type WhatWeAreDoingCard = {
  id: string
  label: string
  image: string
  visible: boolean
}

type WhatWeAreDoingSettingsData = {
  visible: boolean
  tabs: WhatWeAreDoingTab[]
  cards: WhatWeAreDoingCard[]
}

type HomepageSettings = {
  focusAreasVisible: boolean
  initiativesVisible: boolean
  initiativesCount: number
  initiatives: InitiativeCard[]
  quickDonate: QuickDonateSettings
  impact: ImpactSettingsData
  whatWeAreDoing: WhatWeAreDoingSettingsData
  blogs?: unknown
  mediaUpdates?: unknown
  latestNews?: unknown
  testimonials?: unknown
  donateCta?: unknown
  newsletterBanner?: unknown
}

const QUICK_IMAGE = "https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=800&q=80"

const DEFAULT_QUICK_DONATE: QuickDonateSettings = {
  visible: true,
  options: [
    { id: "ramzan", label: "Ramzan Donation", link: "/donate/ramzan-donation-2026", visible: true },
    { id: "general", label: "General", link: "/donate/sadqa-and-zakat", visible: true },
    { id: "daily-food", label: "Daily Food", link: "/donate/food-assistance", visible: true },
    { id: "medical", label: "Medical", link: "/donate/medical-program", visible: true },
    { id: "welfare", label: "Welfare", link: "/donate/welfare-program", visible: true },
    { id: "education", label: "Education", link: "/donate/education-fund", visible: true },
  ],
  cards: [
    {
      id: "quick-left",
      title: "Ramzan Donation",
      description: "Make your Ramzan Donation 2026 a source of mercy and reward.",
      image: QUICK_IMAGE,
      badge: "RAMZAN",
      priceTitle: "Zakat, Sehri and Iftari, Ration",
      visible: true,
    },
    {
      id: "quick-right",
      title: "Your's Fitra, Fidya & Kaffara",
      description: "Fulfill your religious obligations through Fitra, Fidya, and Kaffara.",
      image: QUICK_IMAGE,
      badge: "RAMZAN",
      priceTitle: "",
      visible: true,
    },
  ],
}

const DEFAULT_IMPACT: ImpactSettingsData = {
  visible: true,
  cards: [
    {
      id: "lives",
      value: "1,500,000",
      label: "Lives served every year across Pakistan",
      visible: true,
    },
    {
      id: "food",
      value: "250,000",
      label: "People Fed Daily",
      visible: true,
    },
    {
      id: "family",
      value: "12,000",
      label: "Family Adoptions every Month",
      visible: true,
    },
    {
      id: "students",
      value: "400,000",
      label: "Students taught annually",
      visible: true,
    },
  ],
}

const DEFAULT_WHAT_WE_ARE_DOING: WhatWeAreDoingSettingsData = {
  visible: true,
  tabs: [
    { id: "all", label: "All", visible: true },
    { id: "medical", label: "Medical", visible: true },
    { id: "welfare", label: "Welfare", visible: true },
    { id: "education", label: "Education", visible: true },
  ],
  cards: [
    {
      id: "doing-medical",
      label: "Medical",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
      visible: true,
    },
    {
      id: "doing-welfare",
      label: "Welfare",
      image: "https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=400&q=80",
      visible: true,
    },
    {
      id: "doing-education",
      label: "Education",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
      visible: true,
    },
    {
      id: "doing-ramzan",
      label: "Ramzan",
      image: "https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=400&q=80",
      visible: true,
    },
    {
      id: "doing-food",
      label: "Daily Food",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
      visible: true,
    },
    {
      id: "doing-water",
      label: "Clean Water",
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80",
      visible: true,
    },
  ],
}

const DEFAULTS: HomepageSettings = {
  focusAreasVisible: true,
  initiativesVisible: true,
  initiativesCount: 4,
  initiatives: [
    {
      id: "fitra",
      title: "Fitra, Fidya and Kaffara",
      description:
        "Fulfill your religious obligations through Fitra, Fidya, and Kaffara. Your contribution helps provide food and essential support to those in need across Pakistan.",
      image: "https://images.unsplash.com/photo-1606046604972-77cc76aee944?w=400&q=80",
      overlay: "Your's Fitra, Fidya & Kaffara hope for Poors",
      link: "/donate/fitra-fidya-kaffara",
    },
    {
      id: "ramzan",
      title: "Ramzan 2026",
      description:
        "Make your Ramzan Donation 2026 a source of mercy and reward. Your contribution supports food distribution, charity programs, and iftar for families in need.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
      overlay: "Ramzan Donation 2026",
      link: "/donate/ramzan-donation-2026",
    },
    {
      id: "medical",
      title: "Medical",
      description:
        "Support medical causes that provide essential healthcare, treatment, and life saving support to those in need. Your donation helps improve access to quality care.",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
      overlay: "HIBA WELFARE MEDICAL SERVICES",
      link: "/donate/medical-program",
    },
    {
      id: "education",
      title: "Child Education Campaign",
      description:
        "Empowering the next generation by providing quality education to underprivileged children. We offer free schooling, textbooks, and learning materials.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
      overlay: "Child Education",
      link: "/donate/childrens-education",
    },
  ],
  quickDonate: DEFAULT_QUICK_DONATE,
  impact: DEFAULT_IMPACT,
  whatWeAreDoing: DEFAULT_WHAT_WE_ARE_DOING,
}

function mergeHomepage(homepage: HomepageSettings): HomepageSettings {
  return {
    blogs: homepage.blogs,
    mediaUpdates: homepage.mediaUpdates,
    latestNews: homepage.latestNews,
    testimonials: homepage.testimonials,
    donateCta: homepage.donateCta,
    newsletterBanner: homepage.newsletterBanner,
    ...DEFAULTS,
    ...homepage,
    initiatives: DEFAULTS.initiatives.map((fallback, index) => ({
      ...fallback,
      ...(homepage.initiatives?.[index] ?? {}),
      id: fallback.id,
      link: fallback.link,
    })),
    quickDonate: {
      visible: homepage.quickDonate?.visible !== false,
      options: DEFAULT_QUICK_DONATE.options.map((fallback, index) => ({
        ...fallback,
        ...(homepage.quickDonate?.options?.[index] ?? {}),
        id: fallback.id,
        link: fallback.link,
      })),
      cards: DEFAULT_QUICK_DONATE.cards.map((fallback, index) => ({
        ...fallback,
        ...(homepage.quickDonate?.cards?.[index] ?? {}),
        id: fallback.id,
      })),
    },
    impact: {
      visible: homepage.impact?.visible !== false,
      cards: DEFAULT_IMPACT.cards.map((fallback, index) => ({
        ...fallback,
        ...(homepage.impact?.cards?.[index] ?? {}),
        id: fallback.id,
      })),
    },
    whatWeAreDoing: {
      visible: homepage.whatWeAreDoing?.visible !== false,
      tabs: DEFAULT_WHAT_WE_ARE_DOING.tabs.map((fallback, index) => ({
        ...fallback,
        ...(homepage.whatWeAreDoing?.tabs?.[index] ?? {}),
        id: fallback.id,
      })),
      cards: DEFAULT_WHAT_WE_ARE_DOING.cards.map((fallback, index) => ({
        ...fallback,
        ...(homepage.whatWeAreDoing?.cards?.[index] ?? {}),
        id: fallback.id,
      })),
    },
  }
}

function useHomepageDraft(secret: string) {
  const [settings, setSettingsState] = useState<HomepageSettings>(DEFAULTS)
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const setSettings = (next: HomepageSettings | ((current: HomepageSettings) => HomepageSettings)) => {
    setSaved("")
    setSettingsState(next)
  }

  useEffect(() => {
    let cancelled = false
    void fetch("/api/homepage")
      .then((res) => res.json())
      .then((data: { homepage?: HomepageSettings }) => {
        if (cancelled || !data.homepage || !Array.isArray(data.homepage.initiatives)) return
        setSettingsState(mergeHomepage(data.homepage))
      })
      .catch(() => {
        if (!cancelled) setError("Could not load homepage settings")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (next: HomepageSettings, message: string) => {
    setBusy(true)
    setError("")
    const { ok, data } = await adminFetch("/api/admin/homepage", secret, {
      method: "PUT",
      body: JSON.stringify({ homepage: next }),
    })
    setBusy(false)
    const homepage = data.homepage
    if (!ok || !homepage || typeof homepage !== "object") {
      setError(typeof data.error === "string" ? data.error : "Could not save")
      return
    }
    setSettingsState(mergeHomepage(homepage as HomepageSettings))
    setSaved(message)
  }

  return { settings, setSettings, save, saved, error, busy }
}

function VisibilityToggle({
  shown,
  onChange,
  title = "Show on the website",
  shownText = "This section is visible on the homepage.",
  hiddenText = "This section is hidden on the homepage.",
}: {
  shown: boolean
  onChange: (shown: boolean) => void
  title?: string
  shownText?: string
  hiddenText?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{shown ? shownText : hiddenText}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            shown ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
          }`}
        >
          Show
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            shown ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
          }`}
        >
          Hide
        </button>
      </div>
    </div>
  )
}

function Status({ saved, error }: { saved: string; error: string }) {
  return (
    <>
      {saved ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{saved}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </>
  )
}

async function uploadCardImage(secret: string, cardId: string, file: File): Promise<string> {
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
  if (!res.ok || typeof data.image !== "string") {
    throw new Error(data.error || "Could not upload image")
  }
  return data.image
}

function ImageUploadField({
  secret,
  cardId,
  image,
  overlay,
  uploading,
  onUploading,
  onUploaded,
  onError,
}: {
  secret: string
  cardId: string
  image: string
  overlay?: string
  uploading: boolean
  onUploading: (busy: boolean) => void
  onUploaded: (image: string) => void
  onError: (message: string) => void
}) {
  return (
    <>
      <label className="mt-3 block cursor-pointer overflow-hidden rounded-xl bg-slate-100">
        <div className="relative aspect-[4/3]">
          {image ? (
            <img src={image} alt="" className="h-full w-full cursor-pointer object-cover" />
          ) : (
            <div className="flex h-full cursor-pointer items-center justify-center px-4 text-center text-sm text-slate-500">
              Click to upload an image
            </div>
          )}
          {overlay ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white">
              {overlay}
            </div>
          ) : null}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
              Uploading…
            </div>
          ) : null}
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
            if (!file.type.startsWith("image/")) {
              onError("Choose an image from your computer")
              return
            }
            if (file.size > 5 * 1024 * 1024) {
              onError("Image must be under 5 MB")
              return
            }
            onUploading(true)
            onError("")
            void uploadCardImage(secret, cardId, file)
              .then(onUploaded)
              .catch((error: unknown) => {
                onError(error instanceof Error ? error.message : "Could not upload image")
              })
              .finally(() => onUploading(false))
          }}
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">Click the image to upload a new one from your computer, then press Save.</p>
    </>
  )
}

export function FocusAreaSettings({ secret }: { secret: string }) {
  const { settings, save, saved, error, busy } = useHomepageDraft(secret)

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle
        shown={settings.focusAreasVisible}
        onChange={(focusAreasVisible) => {
          void save({ ...settings, focusAreasVisible }, focusAreasVisible ? "Focus areas are shown" : "Focus areas are hidden")
        }}
      />
      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() => void save(settings, settings.focusAreasVisible ? "Focus areas are shown" : "Focus areas are hidden")}
      />
    </div>
  )
}

export function InitiativesSettings({ secret }: { secret: string }) {
  const { settings, setSettings, save, saved, error, busy } = useHomepageDraft(secret)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")

  const updateCard = (index: number, patch: Partial<InitiativeCard>) => {
    setSettings((current) => ({
      ...current,
      initiatives: current.initiatives.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...patch } : card,
      ),
    }))
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error || uploadError} />
      <VisibilityToggle
        shown={settings.initiativesVisible}
        onChange={(initiativesVisible) => setSettings((current) => ({ ...current, initiativesVisible }))}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">How many cards to show</p>
        <p className="mt-1 text-sm text-slate-500">There are four cards. Choose how many appear on the homepage.</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSettings((current) => ({ ...current, initiativesCount: count }))}
              className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                settings.initiativesCount === count ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {settings.initiatives.map((card, index) => {
          const visible = index < settings.initiativesCount
          return (
            <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">Card {index + 1}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${visible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {visible ? "Shown" : "Hidden"}
                </span>
              </div>
              <ImageUploadField
                secret={secret}
                cardId={card.id}
                image={card.image}
                overlay={card.overlay || "Text on image"}
                uploading={uploadingId === card.id}
                onUploading={(busyUpload) => setUploadingId(busyUpload ? card.id : null)}
                onUploaded={(image) => updateCard(index, { image })}
                onError={setUploadError}
              />
              <label className="mt-3 block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</span>
                <input
                  value={card.title}
                  onChange={(e) => updateCard(index, { title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="mt-3 block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Text</span>
                <textarea
                  value={card.description}
                  rows={3}
                  onChange={(e) => updateCard(index, { description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="mt-3 block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Text on image</span>
                <input
                  value={card.overlay}
                  onChange={(e) => updateCard(index, { overlay: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
            </article>
          )
        })}
      </div>

      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() =>
          void save(
            settings,
            settings.initiativesVisible
              ? `Showing ${settings.initiativesCount} cards`
              : "Initiatives and Live Appeals are hidden",
          )
        }
      />
    </div>
  )
}

export function QuickDonateSettings({ secret }: { secret: string }) {
  const { settings, setSettings, save, saved, error, busy } = useHomepageDraft(secret)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")
  const quickDonate = settings.quickDonate

  const updateOption = (index: number, patch: Partial<QuickDonateOption>) => {
    setSettings((current) => ({
      ...current,
      quickDonate: {
        ...current.quickDonate,
        options: current.quickDonate.options.map((option, optionIndex) =>
          optionIndex === index ? { ...option, ...patch } : option,
        ),
      },
    }))
  }

  const updateCard = (index: number, patch: Partial<QuickDonateCard>) => {
    setSettings((current) => ({
      ...current,
      quickDonate: {
        ...current.quickDonate,
        cards: current.quickDonate.cards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, ...patch } : card,
        ),
      },
    }))
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error || uploadError} />
      <VisibilityToggle
        shown={quickDonate.visible}
        onChange={(visible) =>
          setSettings((current) => ({
            ...current,
            quickDonate: { ...current.quickDonate, visible },
          }))
        }
        shownText="Quick Donate is visible on the homepage."
        hiddenText="Quick Donate is hidden on the homepage."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Category options</p>
        <p className="mt-1 text-sm text-slate-500">Show or hide each tab above the front cards, and rename the label.</p>
        <div className="mt-4 grid gap-3">
          {quickDonate.options.map((option, index) => (
            <div key={option.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
              <input
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
                className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateOption(index, { visible: true })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    option.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => updateOption(index, { visible: false })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    option.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {quickDonate.cards.map((card, index) => (
          <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">
                {card.id === "quick-left" ? "Left front card" : "Right front card"}
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: true })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: false })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>
            <ImageUploadField
              secret={secret}
              cardId={card.id}
              image={card.image}
              overlay={card.title}
              uploading={uploadingId === card.id}
              onUploading={(busyUpload) => setUploadingId(busyUpload ? card.id : null)}
              onUploaded={(image) => updateCard(index, { image })}
              onError={setUploadError}
            />
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Front image text</span>
              <input
                value={card.title}
                onChange={(e) => updateCard(index, { title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supporting text</span>
              <textarea
                value={card.description}
                rows={3}
                onChange={(e) => updateCard(index, { description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badge</span>
              <input
                value={card.badge}
                onChange={(e) => updateCard(index, { badge: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            {card.id === "quick-left" ? (
              <label className="mt-3 block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price box title</span>
                <input
                  value={card.priceTitle}
                  onChange={(e) => updateCard(index, { priceTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </label>
            ) : null}
          </article>
        ))}
      </div>

      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() =>
          void save(
            settings,
            settings.quickDonate.visible ? "Quick Donate settings saved" : "Quick Donate is hidden",
          )
        }
      />
    </div>
  )
}

export function ImpactSettings({ secret }: { secret: string }) {
  const { settings, setSettings, save, saved, error, busy } = useHomepageDraft(secret)
  const impact = settings.impact

  const updateCard = (index: number, patch: Partial<ImpactCard>) => {
    setSettings((current) => ({
      ...current,
      impact: {
        ...current.impact,
        cards: current.impact.cards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, ...patch } : card,
        ),
      },
    }))
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error} />
      <VisibilityToggle
        shown={impact.visible}
        onChange={(visible) =>
          setSettings((current) => ({
            ...current,
            impact: { ...current.impact, visible },
          }))
        }
        shownText="Our Impact In Numbers is visible on the homepage."
        hiddenText="Our Impact In Numbers is hidden on the homepage."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {impact.cards.map((card, index) => (
          <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">Card {index + 1}</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: true })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: false })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Number</span>
              <input
                value={card.value}
                onChange={(e) => updateCard(index, { value: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Text below</span>
              <input
                value={card.label}
                onChange={(e) => updateCard(index, { label: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
          </article>
        ))}
      </div>

      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() =>
          void save(settings, settings.impact.visible ? "Impact numbers saved" : "Impact section is hidden")
        }
      />
    </div>
  )
}

export function WhatWeAreDoingSettings({ secret }: { secret: string }) {
  const { settings, setSettings, save, saved, error, busy } = useHomepageDraft(secret)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")
  const section = settings.whatWeAreDoing

  const updateTab = (index: number, patch: Partial<WhatWeAreDoingTab>) => {
    setSettings((current) => ({
      ...current,
      whatWeAreDoing: {
        ...current.whatWeAreDoing,
        tabs: current.whatWeAreDoing.tabs.map((tab, tabIndex) =>
          tabIndex === index ? { ...tab, ...patch } : tab,
        ),
      },
    }))
  }

  const updateCard = (index: number, patch: Partial<WhatWeAreDoingCard>) => {
    setSettings((current) => ({
      ...current,
      whatWeAreDoing: {
        ...current.whatWeAreDoing,
        cards: current.whatWeAreDoing.cards.map((card, cardIndex) =>
          cardIndex === index ? { ...card, ...patch } : card,
        ),
      },
    }))
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error || uploadError} />
      <VisibilityToggle
        shown={section.visible}
        onChange={(visible) =>
          setSettings((current) => ({
            ...current,
            whatWeAreDoing: { ...current.whatWeAreDoing, visible },
          }))
        }
        shownText="What We Are Doing is visible on the homepage."
        hiddenText="What We Are Doing is hidden on the homepage."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Category tabs</p>
        <p className="mt-1 text-sm text-slate-500">Show or hide each tab, and rename the label.</p>
        <div className="mt-4 grid gap-3">
          {section.tabs.map((tab, index) => (
            <div key={tab.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
              <input
                value={tab.label}
                onChange={(e) => updateTab(index, { label: e.target.value })}
                className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateTab(index, { visible: true })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    tab.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => updateTab(index, { visible: false })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    tab.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {section.cards.map((card, index) => (
          <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">Card {index + 1}</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: true })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => updateCard(index, { visible: false })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    card.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>
            <ImageUploadField
              secret={secret}
              cardId={card.id}
              image={card.image}
              overlay={card.label}
              uploading={uploadingId === card.id}
              onUploading={(busyUpload) => setUploadingId(busyUpload ? card.id : null)}
              onUploaded={(image) => updateCard(index, { image })}
              onError={setUploadError}
            />
            <label className="mt-3 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label on image</span>
              <input
                value={card.label}
                onChange={(e) => updateCard(index, { label: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
          </article>
        ))}
      </div>

      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() =>
          void save(
            settings,
            settings.whatWeAreDoing.visible ? "What We Are Doing settings saved" : "What We Are Doing is hidden",
          )
        }
      />
    </div>
  )
}
