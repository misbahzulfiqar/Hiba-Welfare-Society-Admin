import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  FileText,
  HandHeart,
  Heart,
  Home,
  Image,
  Info,
  Landmark,
  LayoutGrid,
  Mail,
  Megaphone,
  Newspaper,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react"
import { adminFetch } from "../lib/adminApi"
import { DEFAULTS, mergeSettings, type SiteSettingsData } from "../lib/siteSettingsData"
import { AboutSectionSettings, type AboutSectionId } from "./AboutSectionsSettings"
import {
  FocusAreaSettings,
  ImpactSettings,
  InitiativesSettings,
  QuickDonateSettings,
  WhatWeAreDoingSettings,
} from "./HomeSectionsSettings"
import {
  BlogsSettings,
  DonateCtaSettings,
  LatestNewsSettings,
  MediaUpdatesSettings,
  NewsletterBannerSettings,
  TestimonialsSettings,
} from "./ContentListSettings"
import { QuoteSettings } from "./QuoteSettings"
import { SaveActionButton, SaveSuccessBanner } from "./SaveActionButton"

const STORAGE_KEY = "hiba_site_settings"

type SectionId =
  | "hero"
  | "about"
  | "services"
  | "media"
  | "donate"
  | "contact"
  | "bank"
  | "donate-now"
  | "footer"
  | "sticky-bar"
  | "quotes"
  | "focus"
  | "initiatives"
  | "quick-donate"
  | "impact"
  | "what-we-are-doing"
  | "blogs"
  | "media-updates"
  | "latest-news"
  | "testimonials"
  | "donate-cta"
  | "newsletter-banner"
  | AboutSectionId
type Panel = "site" | "home" | "about" | SectionId

const PAGE_CARDS: { id: "home" | SectionId; title: string; description: string; icon: typeof Home }[] = [
  {
    id: "home",
    title: "Home",
    description: "Hero, quotes, focus areas and initiatives on the homepage.",
    icon: Home,
  },
  {
    id: "about",
    title: "About page settings",
    description: "Show or hide each About section and edit titles, text and images.",
    icon: Info,
  },
  {
    id: "services",
    title: "Services",
    description: "Show or hide Services, edit the mega menu and page programs.",
    icon: Building2,
  },
  {
    id: "media",
    title: "Media",
    description: "Show or hide Media, edit News/Videos dropdown and stories.",
    icon: Image,
  },
  {
    id: "donate",
    title: "Donate",
    description: "Show or hide the donate page, and edit the page title.",
    icon: Heart,
  },
  {
    id: "contact",
    title: "Contact us",
    description: "Show or hide contact, and edit email, phones and address.",
    icon: Mail,
  },
  {
    id: "bank",
    title: "Bank details",
    description: "Show or hide bank details, and edit account info for donors.",
    icon: Landmark,
  },
  {
    id: "donate-now",
    title: "Donate Now",
    description: "Show or hide the Donate Now button and edit its label.",
    icon: Zap,
  },
  {
    id: "footer",
    title: "Footer",
    description: "Edit footer brand text and donation category links.",
    icon: Newspaper,
  },
  {
    id: "sticky-bar",
    title: "Sticky donate bar",
    description: "Show or hide the blue bottom bar and edit its quick links.",
    icon: HandHeart,
  },
]

const HOME_CARDS: { id: SectionId; title: string; description: string; icon: typeof Home }[] = [
  {
    id: "hero",
    title: "Hero section settings",
    description: "Heading, tagline and the short description on the homepage.",
    icon: Home,
  },
  {
    id: "quotes",
    title: "Quote settings",
    description: "Edit the homepage quote, or write more and show them in a carousel.",
    icon: Quote,
  },
  {
    id: "focus",
    title: "Our focus areas",
    description: "Show or hide the focus areas row on the homepage.",
    icon: LayoutGrid,
  },
  {
    id: "initiatives",
    title: "Our Initiatives",
    description: "Show or hide Live Appeals, choose how many cards, and edit each one.",
    icon: Megaphone,
  },
  {
    id: "quick-donate",
    title: "Quick Donate",
    description: "Show or hide the section, hide category tabs, and edit front card images and text.",
    icon: HandHeart,
  },
  {
    id: "impact",
    title: "Our Impact In Numbers",
    description: "Show or hide the section, and edit the four impact numbers and labels.",
    icon: ChartNoAxesCombined,
  },
  {
    id: "what-we-are-doing",
    title: "What We Are Doing",
    description: "Show or hide the section, tabs, and cards, and edit images and labels.",
    icon: Sparkles,
  },
  {
    id: "donate-cta",
    title: "Your Donation Can Change Lives",
    description: "Edit the donation banner heading, text and button.",
    icon: Heart,
  },
  {
    id: "testimonials",
    title: "What We Are Say?",
    description: "Add, edit or remove testimonials.",
    icon: Quote,
  },
  {
    id: "blogs",
    title: "Our Blogs",
    description: "Add, edit or remove each blog. Change the title, date, image and excerpt.",
    icon: Newspaper,
  },
  {
    id: "media-updates",
    title: "Media Updates",
    description: "Add, edit or remove each media update.",
    icon: Image,
  },
  {
    id: "latest-news",
    title: "Latest News",
    description: "Add, edit or remove each news card.",
    icon: Megaphone,
  },
  {
    id: "newsletter-banner",
    title: "Subscribe Our Newsletter",
    description: "Edit the newsletter heading and description.",
    icon: Mail,
  },
]

const ABOUT_CARDS: { id: AboutSectionId; title: string; description: string; icon: typeof Home }[] = [
  {
    id: "about-chairman",
    title: "Chairman's Message",
    description: "Show or hide, edit portrait, name, role and message.",
    icon: UserRound,
  },
  {
    id: "about-audit",
    title: "Audit Reports",
    description: "Show or hide and edit the page title and description.",
    icon: FileText,
  },
  {
    id: "about-tax",
    title: "Tax Exemption",
    description: "Show or hide and edit the page title and description.",
    icon: ShieldCheck,
  },
  {
    id: "about-ebook",
    title: "E-Book",
    description: "Show or hide and edit the page title and description.",
    icon: BookOpen,
  },
  {
    id: "about-privacy",
    title: "Privacy Policy",
    description: "Show or hide and edit the page title and description.",
    icon: Scale,
  },
  {
    id: "about-certificates",
    title: "Certificates",
    description: "Show or hide, edit certificate cards, images and titles.",
    icon: Award,
  },
  {
    id: "about-newsletter",
    title: "Newsletter",
    description: "Show or hide and edit the page title and description.",
    icon: Newspaper,
  },
  {
    id: "about-terms",
    title: "Terms & Conditions",
    description: "Show or hide and edit the page title and description.",
    icon: Scale,
  },
]

function loadSettings(): SiteSettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return mergeSettings(JSON.parse(raw) as Partial<SiteSettingsData>)
  } catch {
    return DEFAULTS
  }
}

function sectionTitle(id: SectionId): string {
  switch (id) {
    case "hero":
      return "Hero section settings"
    case "about":
      return "About page settings"
    case "services":
      return "Services"
    case "media":
      return "Media"
    case "donate":
      return "Donate"
    case "contact":
      return "Contact us"
    case "bank":
      return "Bank details"
    case "donate-now":
      return "Donate Now"
    case "footer":
      return "Footer"
    case "sticky-bar":
      return "Sticky donate bar"
    case "quotes":
      return "Quote settings"
    case "focus":
      return "Our focus areas"
    case "initiatives":
      return "Our Initiatives"
    case "quick-donate":
      return "Quick Donate"
    case "impact":
      return "Our Impact In Numbers"
    case "what-we-are-doing":
      return "What We Are Doing"
    case "blogs":
      return "Our Blogs"
    case "media-updates":
      return "Media Updates"
    case "latest-news":
      return "Latest News"
    case "testimonials":
      return "What We Are Say?"
    case "donate-cta":
      return "Your Donation Can Change Lives"
    case "newsletter-banner":
      return "Subscribe Our Newsletter"
    case "about-chairman":
      return "Chairman's Message"
    case "about-audit":
      return "Audit Reports"
    case "about-tax":
      return "Tax Exemption"
    case "about-ebook":
      return "E-Book"
    case "about-privacy":
      return "Privacy Policy"
    case "about-certificates":
      return "Certificates"
    case "about-newsletter":
      return "Newsletter"
    case "about-terms":
      return "Terms & Conditions"
    default: {
      const unreachable: never = id
      return unreachable
    }
  }
}

function preview(data: SiteSettingsData, id: SectionId): string {
  switch (id) {
    case "hero":
      return data.home.tagline
    case "about":
      return "Eight About sections"
    case "services":
      return data.services.visible ? `${data.services.items.length} services` : "Hidden"
    case "media":
      return data.media.visible
        ? `${data.media.news.length} news · ${data.media.videos.length} videos`
        : "Hidden"
    case "donate":
      return data.donate.visible ? data.donate.title : "Hidden"
    case "contact":
      return data.contact.visible ? data.contact.email : "Hidden"
    case "bank":
      return data.bank.visible ? `${data.bank.bankName} · ${data.bank.accountTitle}` : "Hidden"
    case "donate-now":
      return data.donateNow.visible ? data.donateNow.label : "Hidden"
    case "footer":
      return data.footer.brandName
    case "sticky-bar":
      return data.stickyBar.visible ? `${data.stickyBar.links.length} links` : "Hidden"
    case "quotes":
      return "Edit, write, add more"
    case "focus":
      return "Show or hide"
    case "initiatives":
      return "Four cards"
    case "quick-donate":
      return "Tabs and front cards"
    case "impact":
      return "Four number cards"
    case "what-we-are-doing":
      return "Tabs and six cards"
    case "blogs":
      return "Add, edit, remove"
    case "media-updates":
      return "Add, edit, remove"
    case "latest-news":
      return "Add, edit, remove"
    case "testimonials":
      return "Add, edit, remove"
    case "donate-cta":
      return "Heading and button"
    case "newsletter-banner":
      return "Heading and text"
    case "about-chairman":
      return "Show, hide and edit"
    case "about-audit":
    case "about-tax":
    case "about-ebook":
    case "about-privacy":
    case "about-newsletter":
    case "about-terms":
      return "Show, hide and edit"
    case "about-certificates":
      return "Cards and images"
    default: {
      const unreachable: never = id
      return unreachable
    }
  }
}

function Field({
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
  const className =
    "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={className} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </label>
  )
}

function VisibilityToggle({
  shown,
  onChange,
  shownText,
  hiddenText,
}: {
  shown: boolean
  onChange: (shown: boolean) => void
  shownText: string
  hiddenText: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Show on the website</p>
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

function backTarget(id: SectionId): "site" | "home" | "about" {
  switch (id) {
    case "hero":
    case "quotes":
    case "focus":
    case "initiatives":
    case "quick-donate":
    case "impact":
    case "what-we-are-doing":
    case "blogs":
    case "media-updates":
    case "latest-news":
    case "testimonials":
    case "donate-cta":
    case "newsletter-banner":
      return "home"
    case "about-chairman":
    case "about-audit":
    case "about-tax":
    case "about-ebook":
    case "about-privacy":
    case "about-certificates":
    case "about-newsletter":
    case "about-terms":
      return "about"
    case "about":
    case "services":
    case "media":
    case "donate":
    case "contact":
    case "bank":
    case "donate-now":
    case "footer":
    case "sticky-bar":
      return "site"
    default: {
      const unreachable: never = id
      return unreachable
    }
  }
}

function CardGrid({
  cards,
  data,
  onOpen,
}: {
  cards: { id: "home" | SectionId; title: string; description: string; icon: typeof Home }[]
  data: SiteSettingsData
  onOpen: (id: "home" | SectionId) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpen(card.id)}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="mt-4 text-base font-semibold text-slate-900">{card.title}</span>
            <span className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{card.description}</span>
            <span className="mt-4 truncate text-xs font-medium text-emerald-700">
              {card.id === "home" ? "Homepage sections" : preview(data, card.id)}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
              Open
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SiteSettings({ secret }: { secret: string }) {
  const [data, setDataState] = useState<SiteSettingsData>(loadSettings)
  const [panel, setPanel] = useState<Panel>("site")
  const [savedMessage, setSavedMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [busy, setBusy] = useState(false)

  const setData = (next: SiteSettingsData) => {
    setSavedMessage("")
    setDataState(next)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/site-content")
        const body = (await res.json()) as { content?: Partial<SiteSettingsData>; stored?: boolean }
        if (cancelled) return
        const localRaw = localStorage.getItem(STORAGE_KEY)
        if (!body.stored && localRaw) {
          const local = loadSettings()
          setData(local)
          await adminFetch("/api/admin/site-content", secret, {
            method: "PUT",
            body: JSON.stringify({ content: local }),
          })
          return
        }
        if (body.content) setData(mergeSettings(body.content))
      } catch {
        if (!cancelled) setData(loadSettings())
      }
    })()
    return () => {
      cancelled = true
    }
  }, [secret])

  const save = async (message = "Saved. The website is showing this update.") => {
    setSaveError("")
    setBusy(true)
    const { ok, data: body } = await adminFetch("/api/admin/site-content", secret, {
      method: "PUT",
      body: JSON.stringify({ content: data }),
    })
    setBusy(false)
    if (!ok) {
      setSavedMessage("")
      setSaveError(typeof body.error === "string" ? body.error : "Could not save to the website")
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSavedMessage(message)
  }

  const openCard = (id: "home" | SectionId) => {
    setSavedMessage("")
    setSaveError("")
    setPanel(id)
  }

  if (panel === "site") {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Website</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Site settings</h3>
          <p className="mt-1 text-sm text-slate-500">Choose a page. Homepage sections are inside Home.</p>
        </div>
        <CardGrid cards={PAGE_CARDS} data={data} onOpen={openCard} />
      </div>
    )
  }

  if (panel === "home") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPanel("site")}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Site settings
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Homepage</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Home</h3>
          <p className="mt-1 text-sm text-slate-500">Choose a homepage section to edit.</p>
        </div>
        <CardGrid cards={HOME_CARDS} data={data} onOpen={openCard} />
      </div>
    )
  }

  if (panel === "about") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setPanel("site")}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Site settings
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">About</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">About page settings</h3>
          <p className="mt-1 text-sm text-slate-500">Choose an About section to show, hide or edit.</p>
        </div>
        <CardGrid cards={ABOUT_CARDS} data={data} onOpen={openCard} />
      </div>
    )
  }

  const active = panel
  const usesOwnSave =
    active === "quotes" ||
    active === "focus" ||
    active === "initiatives" ||
    active === "quick-donate" ||
    active === "impact" ||
    active === "what-we-are-doing" ||
    active === "blogs" ||
    active === "media-updates" ||
    active === "latest-news" ||
    active === "testimonials" ||
    active === "donate-cta" ||
    active === "newsletter-banner" ||
    active.startsWith("about-")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => setPanel(backTarget(active))}
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {backTarget(active) === "home" ? "Home" : backTarget(active) === "about" ? "About" : "Site settings"}
          </button>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{sectionTitle(active)}</h3>
        </div>
        {usesOwnSave ? null : (
          <SaveActionButton busy={busy} saved={Boolean(savedMessage)} onClick={() => void save()} />
        )}
      </div>
      {usesOwnSave ? null : <SaveSuccessBanner message={savedMessage} />}
      {saveError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
      ) : null}

      {active === "hero" ? (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Field label="Heading" value={data.home.heading} onChange={(heading) => setData({ ...data, home: { ...data.home, heading } })} />
          <Field label="Tagline" value={data.home.tagline} onChange={(tagline) => setData({ ...data, home: { ...data.home, tagline } })} />
          <Field
            label="Description"
            value={data.home.description}
            multiline
            onChange={(description) => setData({ ...data, home: { ...data.home, description } })}
          />
        </div>
      ) : null}

      {active === "quotes" ? <QuoteSettings secret={secret} /> : null}
      {active === "focus" ? <FocusAreaSettings secret={secret} /> : null}
      {active === "initiatives" ? <InitiativesSettings secret={secret} /> : null}
      {active === "quick-donate" ? <QuickDonateSettings secret={secret} /> : null}
      {active === "impact" ? <ImpactSettings secret={secret} /> : null}
      {active === "what-we-are-doing" ? <WhatWeAreDoingSettings secret={secret} /> : null}
      {active === "blogs" ? <BlogsSettings secret={secret} /> : null}
      {active === "media-updates" ? <MediaUpdatesSettings secret={secret} /> : null}
      {active === "latest-news" ? <LatestNewsSettings secret={secret} /> : null}
      {active === "testimonials" ? <TestimonialsSettings secret={secret} /> : null}
      {active === "donate-cta" ? <DonateCtaSettings secret={secret} /> : null}
      {active === "newsletter-banner" ? <NewsletterBannerSettings secret={secret} /> : null}

      {active.startsWith("about-") ? <AboutSectionSettings secret={secret} section={active as AboutSectionId} /> : null}

      {active === "services" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.services.visible}
            shownText="Services is visible in the menu and on its page."
            hiddenText="Services is hidden from the menu and page."
            onChange={(visible) => setData({ ...data, services: { ...data.services, visible } })}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Page title"
              value={data.services.title}
              onChange={(title) => setData({ ...data, services: { ...data.services, title } })}
            />
            <div className="mt-4">
              <Field
                label="Intro"
                value={data.services.intro}
                multiline
                onChange={(intro) => setData({ ...data, services: { ...data.services, intro } })}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Services mega menu</h4>
            <p className="mt-1 text-sm text-slate-500">Show or hide categories and edit the labels in the Services dropdown.</p>
            <div className="mt-3 space-y-4">
              {data.services.menu.map((section, sectionIndex) => (
                <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[180px] flex-1">
                      <Field
                        label="Category title"
                        value={section.title}
                        onChange={(title) => {
                          const menu = data.services.menu.slice()
                          menu[sectionIndex] = { ...section, title }
                          setData({ ...data, services: { ...data.services, menu } })
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          const menu = data.services.menu.slice()
                          menu[sectionIndex] = { ...section, visible: true }
                          setData({ ...data, services: { ...data.services, menu } })
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          section.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                        }`}
                      >
                        Show
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const menu = data.services.menu.slice()
                          menu[sectionIndex] = { ...section, visible: false }
                          setData({ ...data, services: { ...data.services, menu } })
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          section.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                        }`}
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {section.items.map((item, itemIndex) => (
                      <label key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Item {itemIndex + 1}
                        </span>
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const menu = data.services.menu.slice()
                            const items = section.items.slice()
                            items[itemIndex] = { ...item, label: e.target.value }
                            menu[sectionIndex] = { ...section, items }
                            setData({ ...data, services: { ...data.services, menu } })
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const menu = data.services.menu.slice()
                              const items = section.items.slice()
                              items[itemIndex] = { ...item, visible: true }
                              menu[sectionIndex] = { ...section, items }
                              setData({ ...data, services: { ...data.services, menu } })
                            }}
                            className={`rounded px-2 py-1 text-[11px] font-semibold ${
                              item.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                            }`}
                          >
                            Show
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const menu = data.services.menu.slice()
                              const items = section.items.slice()
                              items[itemIndex] = { ...item, visible: false }
                              menu[sectionIndex] = { ...section, items }
                              setData({ ...data, services: { ...data.services, menu } })
                            }}
                            className={`rounded px-2 py-1 text-[11px] font-semibold ${
                              item.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                            }`}
                          >
                            Hide
                          </button>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.services.items.map((item, index) => (
              <label key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Page service {index + 1}</span>
                <input
                  value={item}
                  onChange={(e) => {
                    const items = data.services.items.slice()
                    items[index] = e.target.value
                    setData({ ...data, services: { ...data.services, items } })
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {active === "media" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.media.visible}
            shownText="Media is visible in the menu and on its page."
            hiddenText="Media is hidden from the menu and page."
            onChange={(visible) => setData({ ...data, media: { ...data.media, visible } })}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Page title"
              value={data.media.title}
              onChange={(title) => setData({ ...data, media: { ...data.media, title } })}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Dropdown · News</h4>
              <div className="mt-3 space-y-3">
                <VisibilityToggle
                  shown={data.media.menuNews.visible}
                  shownText="News appears in the Media dropdown."
                  hiddenText="News is hidden from the Media dropdown."
                  onChange={(visible) =>
                    setData({ ...data, media: { ...data.media, menuNews: { ...data.media.menuNews, visible } } })
                  }
                />
                <Field
                  label="Label"
                  value={data.media.menuNews.label}
                  onChange={(label) =>
                    setData({ ...data, media: { ...data.media, menuNews: { ...data.media.menuNews, label } } })
                  }
                />
                <Field
                  label="Description"
                  value={data.media.menuNews.description}
                  onChange={(description) =>
                    setData({
                      ...data,
                      media: { ...data.media, menuNews: { ...data.media.menuNews, description } },
                    })
                  }
                />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Dropdown · Videos</h4>
              <div className="mt-3 space-y-3">
                <VisibilityToggle
                  shown={data.media.menuVideos.visible}
                  shownText="Videos appears in the Media dropdown."
                  hiddenText="Videos is hidden from the Media dropdown."
                  onChange={(visible) =>
                    setData({
                      ...data,
                      media: { ...data.media, menuVideos: { ...data.media.menuVideos, visible } },
                    })
                  }
                />
                <Field
                  label="Label"
                  value={data.media.menuVideos.label}
                  onChange={(label) =>
                    setData({
                      ...data,
                      media: { ...data.media, menuVideos: { ...data.media.menuVideos, label } },
                    })
                  }
                />
                <Field
                  label="Description"
                  value={data.media.menuVideos.description}
                  onChange={(description) =>
                    setData({
                      ...data,
                      media: { ...data.media, menuVideos: { ...data.media.menuVideos, description } },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">News stories</h4>
              {data.media.news.map((item, index) => (
                <label key={`news-${index}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Story {index + 1}</span>
                  <textarea
                    value={item}
                    rows={2}
                    onChange={(e) => {
                      const news = data.media.news.slice()
                      news[index] = e.target.value
                      setData({ ...data, media: { ...data.media, news } })
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Videos</h4>
              {data.media.videos.map((item, index) => (
                <label key={`video-${index}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Video {index + 1}</span>
                  <textarea
                    value={item}
                    rows={2}
                    onChange={(e) => {
                      const videos = data.media.videos.slice()
                      videos[index] = e.target.value
                      setData({ ...data, media: { ...data.media, videos } })
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {active === "donate" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.donate.visible}
            shownText="Donate is visible in the menu and on its page."
            hiddenText="Donate is hidden from the menu and page."
            onChange={(visible) => setData({ ...data, donate: { ...data.donate, visible } })}
          />
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Page title"
              value={data.donate.title}
              onChange={(title) => setData({ ...data, donate: { ...data.donate, title } })}
            />
            <Field
              label="Description"
              value={data.donate.description}
              multiline
              onChange={(description) => setData({ ...data, donate: { ...data.donate, description } })}
            />
          </div>
        </div>
      ) : null}

      {active === "contact" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.contact.visible}
            shownText="Contact Us is visible in the menu and on its page."
            hiddenText="Contact Us is hidden from the menu and page."
            onChange={(visible) => setData({ ...data, contact: { ...data.contact, visible } })}
          />
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Page title"
              value={data.contact.title}
              onChange={(title) => setData({ ...data, contact: { ...data.contact, title } })}
            />
            <Field label="Email" value={data.contact.email} onChange={(email) => setData({ ...data, contact: { ...data.contact, email } })} />
            <Field
              label="Phone numbers"
              value={data.contact.phones}
              multiline
              onChange={(phones) => setData({ ...data, contact: { ...data.contact, phones } })}
            />
            <Field
              label="Address"
              value={data.contact.address}
              multiline
              onChange={(address) => setData({ ...data, contact: { ...data.contact, address } })}
            />
          </div>
        </div>
      ) : null}

      {active === "bank" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.bank.visible}
            shownText="Bank Details is visible in the menu and on its page."
            hiddenText="Bank Details is hidden from the menu and page."
            onChange={(visible) => setData({ ...data, bank: { ...data.bank, visible } })}
          />
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
            <Field
              label="Page title"
              value={data.bank.title}
              onChange={(title) => setData({ ...data, bank: { ...data.bank, title } })}
            />
            <Field
              label="Bank name"
              value={data.bank.bankName}
              onChange={(bankName) => setData({ ...data, bank: { ...data.bank, bankName } })}
            />
            <Field
              label="Bank subtitle"
              value={data.bank.bankSubtitle}
              onChange={(bankSubtitle) => setData({ ...data, bank: { ...data.bank, bankSubtitle } })}
            />
            <Field
              label="Account title"
              value={data.bank.accountTitle}
              onChange={(accountTitle) => setData({ ...data, bank: { ...data.bank, accountTitle } })}
            />
            <Field
              label="Account number"
              value={data.bank.accountNumber}
              onChange={(accountNumber) => setData({ ...data, bank: { ...data.bank, accountNumber } })}
            />
            <Field label="IBAN" value={data.bank.iban} onChange={(iban) => setData({ ...data, bank: { ...data.bank, iban } })} />
          </div>
        </div>
      ) : null}

      {active === "donate-now" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.donateNow.visible}
            shownText="The Donate Now button is visible in the header and sticky bar."
            hiddenText="The Donate Now button is hidden."
            onChange={(visible) => setData({ ...data, donateNow: { ...data.donateNow, visible } })}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Button label"
              value={data.donateNow.label}
              onChange={(label) => setData({ ...data, donateNow: { ...data.donateNow, label } })}
            />
          </div>
        </div>
      ) : null}

      {active === "footer" ? (
        <div className="space-y-4">
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Field
              label="Brand name"
              value={data.footer.brandName}
              onChange={(brandName) => setData({ ...data, footer: { ...data.footer, brandName } })}
            />
            <Field
              label="Brand text"
              value={data.footer.brandText}
              multiline
              onChange={(brandText) => setData({ ...data, footer: { ...data.footer, brandText } })}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Donation categories</h4>
            <p className="mt-1 text-sm text-slate-500">Links shown in the footer donation column.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.footer.donationCategories.map((link, index) => (
                <div key={link.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Field
                    label="Label"
                    value={link.label}
                    onChange={(label) => {
                      const donationCategories = data.footer.donationCategories.slice()
                      donationCategories[index] = { ...link, label }
                      setData({ ...data, footer: { ...data.footer, donationCategories } })
                    }}
                  />
                  <div className="mt-3">
                    <Field
                      label="Link"
                      value={link.href}
                      onChange={(href) => {
                        const donationCategories = data.footer.donationCategories.slice()
                        donationCategories[index] = { ...link, href }
                        setData({ ...data, footer: { ...data.footer, donationCategories } })
                      }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const donationCategories = data.footer.donationCategories.slice()
                        donationCategories[index] = { ...link, visible: true }
                        setData({ ...data, footer: { ...data.footer, donationCategories } })
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        link.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      Show
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const donationCategories = data.footer.donationCategories.slice()
                        donationCategories[index] = { ...link, visible: false }
                        setData({ ...data, footer: { ...data.footer, donationCategories } })
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        link.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                      }`}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {active === "sticky-bar" ? (
        <div className="space-y-4">
          <VisibilityToggle
            shown={data.stickyBar.visible}
            shownText="The blue sticky donate bar is visible at the bottom of the site."
            hiddenText="The sticky donate bar is hidden."
            onChange={(visible) => setData({ ...data, stickyBar: { ...data.stickyBar, visible } })}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.stickyBar.links.map((link, index) => (
              <div key={link.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Field
                  label="Label"
                  value={link.label}
                  onChange={(label) => {
                    const links = data.stickyBar.links.slice()
                    links[index] = { ...link, label }
                    setData({ ...data, stickyBar: { ...data.stickyBar, links } })
                  }}
                />
                <div className="mt-3">
                  <Field
                    label="Link"
                    value={link.href}
                    onChange={(href) => {
                      const links = data.stickyBar.links.slice()
                      links[index] = { ...link, href }
                      setData({ ...data, stickyBar: { ...data.stickyBar, links } })
                    }}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const links = data.stickyBar.links.slice()
                      links[index] = { ...link, visible: true }
                      setData({ ...data, stickyBar: { ...data.stickyBar, links } })
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      link.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                    }`}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const links = data.stickyBar.links.slice()
                      links[index] = { ...link, visible: false }
                      setData({ ...data, stickyBar: { ...data.stickyBar, links } })
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      link.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                    }`}
                  >
                    Hide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
