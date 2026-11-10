import { useEffect, useState } from "react"
import { adminFetch } from "../lib/adminApi"
import { SaveActionButton } from "./SaveActionButton"

type AboutNavPage = {
  visible: boolean
  navLabel: string
  navDescription: string
  eyebrow: string
  title: string
  description: string
}

type AboutChairmanPage = AboutNavPage & {
  chairmanName: string
  chairmanRole: string
  greeting: string
  message: string
  portrait: string
}

type AboutCertificateItem = {
  id: string
  title: string
  image: string
  visible: boolean
  isLatest: boolean
}

type AboutPagesSettings = {
  chairman: AboutChairmanPage
  audit: AboutNavPage
  tax: AboutNavPage
  ebook: AboutNavPage
  privacy: AboutNavPage
  certificates: AboutNavPage & { items: AboutCertificateItem[] }
  newsletter: AboutNavPage
  terms: AboutNavPage
}

export type AboutSectionId =
  | "about-chairman"
  | "about-audit"
  | "about-tax"
  | "about-ebook"
  | "about-privacy"
  | "about-certificates"
  | "about-newsletter"
  | "about-terms"

function page(
  navLabel: string,
  navDescription: string,
  eyebrow: string,
  title: string,
  description: string,
): AboutNavPage {
  return { visible: true, navLabel, navDescription, eyebrow, title, description }
}

const DEFAULTS: AboutPagesSettings = {
  chairman: {
    ...page(
      "Chairman's Message",
      "Message from the chairman",
      "About Us",
      "Chairman's Message",
      "Message from the chairman of Hiba Welfare Society.",
    ),
    chairmanName: "Muhammad Bashir Farooqi",
    chairmanRole: "Chairman, Hiba Welfare Society",
    greeting: "Assalam-o-Alaikum,",
    message:
      "It should be noted that Allah, who is in need of no one and nothing, instills upon His men to give Qarz-e-Hasana because it is in man's nature to be frugal while spending his wealth.",
    portrait: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=420&q=80",
  },
  audit: page(
    "Audit Reports",
    "Financial transparency",
    "Transparency",
    "Audit Reports",
    "As part of our commitment to transparency and accountability, we publish annual audit reports conducted by independent chartered accountants.",
  ),
  tax: page(
    "Tax Exemption",
    "Tax deduction benefits",
    "Transparency",
    "Tax Exemption",
    "We maintain clear and updated tax exemption documentation so donors can contribute with confidence and accountability.",
  ),
  ebook: page(
    "E-Book",
    "Digital publications",
    "Publications",
    "E-Book",
    "Explore our digital publications and partner alliances.",
  ),
  privacy: page(
    "Privacy Policy",
    "Privacy information",
    "Legal",
    "Privacy Policy",
    "At Hiba Welfare Society, your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information.",
  ),
  certificates: {
    ...page(
      "Certificates",
      "Our certifications",
      "Recognition",
      "Certificates & Awards",
      "View our official certificates, awards, and recognitions that validate our commitment to excellence, transparency, and impactful humanitarian work across Pakistan.",
    ),
    items: [
      {
        id: "pcp-certificate",
        title: "PCP Certificate",
        image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=700&q=80",
        visible: true,
        isLatest: true,
      },
    ],
  },
  newsletter: page(
    "Newsletter",
    "Subscribe to updates",
    "Stay Informed",
    "Annual Newsletter",
    "Stay updated with our latest initiatives, success stories, and impact reports.",
  ),
  terms: page(
    "Terms & Conditions",
    "Terms of service",
    "Legal",
    "Terms & Conditions",
    "Please read these terms carefully before using our website or making a donation.",
  ),
}

function mergePages(incoming: AboutPagesSettings): AboutPagesSettings {
  return {
    chairman: { ...DEFAULTS.chairman, ...incoming.chairman },
    audit: { ...DEFAULTS.audit, ...incoming.audit },
    tax: { ...DEFAULTS.tax, ...incoming.tax },
    ebook: { ...DEFAULTS.ebook, ...incoming.ebook },
    privacy: { ...DEFAULTS.privacy, ...incoming.privacy },
    certificates: {
      ...DEFAULTS.certificates,
      ...incoming.certificates,
      items: DEFAULTS.certificates.items.map((fallback, index) => ({
        ...fallback,
        ...(incoming.certificates?.items?.[index] ?? {}),
        id: fallback.id,
      })),
    },
    newsletter: { ...DEFAULTS.newsletter, ...incoming.newsletter },
    terms: { ...DEFAULTS.terms, ...incoming.terms },
  }
}

function useAboutDraft(secret: string) {
  const [settings, setSettingsState] = useState<AboutPagesSettings>(DEFAULTS)
  const [saved, setSaved] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const setSettings = (
    next: AboutPagesSettings | ((current: AboutPagesSettings) => AboutPagesSettings),
  ) => {
    setSaved("")
    setSettingsState(next)
  }

  useEffect(() => {
    let cancelled = false
    void fetch("/api/about-pages")
      .then((res) => res.json())
      .then((data: { aboutPages?: AboutPagesSettings }) => {
        if (cancelled || !data.aboutPages) return
        setSettingsState(mergePages(data.aboutPages))
      })
      .catch(() => {
        if (!cancelled) setError("Could not load about page settings")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (next: AboutPagesSettings, message: string) => {
    setBusy(true)
    setError("")
    const { ok, data } = await adminFetch("/api/admin/about-pages", secret, {
      method: "PUT",
      body: JSON.stringify({ aboutPages: next }),
    })
    setBusy(false)
    if (!ok || !data.aboutPages || typeof data.aboutPages !== "object") {
      setError(typeof data.error === "string" ? data.error : "Could not save")
      return
    }
    setSettingsState(mergePages(data.aboutPages as AboutPagesSettings))
    setSaved(message)
  }

  return { settings, setSettings, save, saved, error, busy }
}

function Status({ saved, error }: { saved: string; error: string }) {
  return (
    <>
      {saved ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{saved}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </>
  )
}

function VisibilityToggle({
  shown,
  onChange,
}: {
  shown: boolean
  onChange: (shown: boolean) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Show on the website</p>
      <p className="mt-1 text-sm text-slate-500">
        {shown ? "This About section is visible in the menu and on its page." : "This About section is hidden from the menu and page."}
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
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
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

async function uploadImage(secret: string, cardId: string, file: File) {
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

function PageFields({
  page,
  onChange,
}: {
  page: AboutNavPage
  onChange: (patch: Partial<AboutNavPage>) => void
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Field label="Menu label" value={page.navLabel} onChange={(navLabel) => onChange({ navLabel })} />
      <Field
        label="Menu description"
        value={page.navDescription}
        onChange={(navDescription) => onChange({ navDescription })}
      />
      <Field label="Eyebrow" value={page.eyebrow} onChange={(eyebrow) => onChange({ eyebrow })} />
      <Field label="Page title" value={page.title} onChange={(title) => onChange({ title })} />
      <Field
        label="Page description"
        value={page.description}
        multiline
        onChange={(description) => onChange({ description })}
      />
    </div>
  )
}

function AboutPageEditor({
  secret,
  pageKey,
  title,
}: {
  secret: string
  pageKey: keyof AboutPagesSettings
  title: string
}) {
  const { settings, setSettings, save, saved, error, busy } = useAboutDraft(secret)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const page = settings[pageKey]

  const patchPage = (patch: Partial<AboutNavPage>) => {
    setSettings((current) => ({
      ...current,
      [pageKey]: { ...current[pageKey], ...patch },
    }))
  }

  return (
    <div className="space-y-4">
      <Status saved={saved} error={error || uploadError} />
      <VisibilityToggle shown={page.visible} onChange={(visible) => patchPage({ visible })} />
      <PageFields page={page} onChange={patchPage} />

      {pageKey === "chairman" ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block cursor-pointer overflow-hidden rounded-xl bg-slate-100">
            <div className="relative aspect-square max-w-[220px]">
              <img
                src={settings.chairman.portrait}
                alt=""
                className="h-full w-full cursor-pointer object-cover"
              />
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
                setUploading(true)
                setUploadError("")
                void uploadImage(secret, "chairman-portrait", file)
                  .then((portrait) =>
                    setSettings((current) => ({
                      ...current,
                      chairman: { ...current.chairman, portrait },
                    })),
                  )
                  .catch((err: unknown) => {
                    setUploadError(err instanceof Error ? err.message : "Could not upload image")
                  })
                  .finally(() => setUploading(false))
              }}
            />
          </label>
          <p className="text-xs text-slate-500">Click the portrait to upload a new image, then Save.</p>
          <Field
            label="Chairman name"
            value={settings.chairman.chairmanName}
            onChange={(chairmanName) =>
              setSettings((current) => ({ ...current, chairman: { ...current.chairman, chairmanName } }))
            }
          />
          <Field
            label="Role"
            value={settings.chairman.chairmanRole}
            onChange={(chairmanRole) =>
              setSettings((current) => ({ ...current, chairman: { ...current.chairman, chairmanRole } }))
            }
          />
          <Field
            label="Greeting"
            value={settings.chairman.greeting}
            onChange={(greeting) =>
              setSettings((current) => ({ ...current, chairman: { ...current.chairman, greeting } }))
            }
          />
          <Field
            label="Message"
            value={settings.chairman.message}
            multiline
            onChange={(message) =>
              setSettings((current) => ({ ...current, chairman: { ...current.chairman, message } }))
            }
          />
        </div>
      ) : null}

      {pageKey === "certificates" ? (
        <div className="grid gap-4">
          {settings.certificates.items.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">Certificate {index + 1}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        certificates: {
                          ...current.certificates,
                          items: current.certificates.items.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, visible: true } : row,
                          ),
                        },
                      }))
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      item.visible ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"
                    }`}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        certificates: {
                          ...current.certificates,
                          items: current.certificates.items.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, visible: false } : row,
                          ),
                        },
                      }))
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      item.visible ? "border border-slate-200 text-slate-600" : "bg-slate-800 text-white"
                    }`}
                  >
                    Hide
                  </button>
                </div>
              </div>
              <label className="mt-3 block cursor-pointer overflow-hidden rounded-xl bg-slate-100">
                <div className="relative aspect-[4/3]">
                  <img src={item.image} alt="" className="h-full w-full cursor-pointer object-cover" />
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
                    setUploading(true)
                    setUploadError("")
                    void uploadImage(secret, item.id, file)
                      .then((image) =>
                        setSettings((current) => ({
                          ...current,
                          certificates: {
                            ...current.certificates,
                            items: current.certificates.items.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, image } : row,
                            ),
                          },
                        })),
                      )
                      .catch((err: unknown) => {
                        setUploadError(err instanceof Error ? err.message : "Could not upload image")
                      })
                      .finally(() => setUploading(false))
                  }}
                />
              </label>
              <Field
                label="Certificate title"
                value={item.title}
                onChange={(nextTitle) =>
                  setSettings((current) => ({
                    ...current,
                    certificates: {
                      ...current.certificates,
                      items: current.certificates.items.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, title: nextTitle } : row,
                      ),
                    },
                  }))
                }
              />
            </article>
          ))}
        </div>
      ) : null}

      <SaveActionButton
        busy={busy}
        saved={Boolean(saved)}
        onClick={() => void save(settings, `${title} saved`)}
      />
    </div>
  )
}

export function AboutSectionSettings({ secret, section }: { secret: string; section: AboutSectionId }) {
  switch (section) {
    case "about-chairman":
      return <AboutPageEditor secret={secret} pageKey="chairman" title="Chairman's Message" />
    case "about-audit":
      return <AboutPageEditor secret={secret} pageKey="audit" title="Audit Reports" />
    case "about-tax":
      return <AboutPageEditor secret={secret} pageKey="tax" title="Tax Exemption" />
    case "about-ebook":
      return <AboutPageEditor secret={secret} pageKey="ebook" title="E-Book" />
    case "about-privacy":
      return <AboutPageEditor secret={secret} pageKey="privacy" title="Privacy Policy" />
    case "about-certificates":
      return <AboutPageEditor secret={secret} pageKey="certificates" title="Certificates" />
    case "about-newsletter":
      return <AboutPageEditor secret={secret} pageKey="newsletter" title="Newsletter" />
    case "about-terms":
      return <AboutPageEditor secret={secret} pageKey="terms" title="Terms & Conditions" />
    default: {
      const unreachable: never = section
      return unreachable
    }
  }
}
