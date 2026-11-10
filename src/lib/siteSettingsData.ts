export type ServiceMenuItem = { id: string; label: string; visible: boolean }
export type ServiceMenuSection = { id: string; title: string; visible: boolean; items: ServiceMenuItem[] }
export type MediaMenuLink = { visible: boolean; label: string; description: string }
export type NavTextLink = { id: string; label: string; href: string; visible: boolean }

export type SiteSettingsData = {
  home: {
    heading: string
    tagline: string
    description: string
  }
  about: {
    title: string
    chairmanName: string
    chairmanRole: string
    greeting: string
    message: string
  }
  services: {
    visible: boolean
    title: string
    intro: string
    items: string[]
    menu: ServiceMenuSection[]
  }
  media: {
    visible: boolean
    title: string
    news: string[]
    videos: string[]
    menuNews: MediaMenuLink
    menuVideos: MediaMenuLink
  }
  donate: {
    visible: boolean
    title: string
    description: string
  }
  contact: {
    visible: boolean
    title: string
    email: string
    phones: string
    address: string
  }
  bank: {
    visible: boolean
    title: string
    bankName: string
    bankSubtitle: string
    accountTitle: string
    accountNumber: string
    iban: string
  }
  donateNow: {
    visible: boolean
    label: string
  }
  footer: {
    brandName: string
    brandText: string
    donationCategories: NavTextLink[]
  }
  stickyBar: {
    visible: boolean
    links: NavTextLink[]
  }
}

function menuItem(id: string, label: string): ServiceMenuItem {
  return { id, label, visible: true }
}

function menuSection(id: string, title: string, items: Array<[string, string]>): ServiceMenuSection {
  return {
    id,
    title,
    visible: true,
    items: items.map(([itemId, label]) => menuItem(itemId, label)),
  }
}

function navLink(id: string, label: string, href: string): NavTextLink {
  return { id, label, href, visible: true }
}

export const DEFAULT_SERVICE_MENU: ServiceMenuSection[] = [
  menuSection("health", "Health", [
    ["mother-child-care", "Mother & Child Care"],
    ["blood-bank-thalassemia", "Blood Bank & Thalassemia"],
    ["medical-equipment", "Medical Equipment"],
    ["hijama", "Hijama"],
    ["laboratory", "Laboratory"],
    ["x-ray-ultrasound", "X-Ray & Ultrasound"],
    ["mobile-clinic", "Mobile Clinic"],
  ]),
  menuSection("education", "Education", [
    ["schooling-system", "Schooling System"],
    ["smit", "SMIT"],
    ["piaic", "PIAIC"],
    ["madarisa", "Madarisa"],
    ["online-quran-academy", "Online Quran Academy"],
    ["sbil", "SBIL"],
    ["motorbike-mechanic", "Motorbike Mechanic"],
    ["mobile-repairing", "Mobile Repairing"],
  ]),
  menuSection("food-ration", "Food & Ration", [
    ["ration-support", "Ration Support"],
    ["dastarkhwan", "Hiba welfare Dastarkhwan"],
    ["breakfast", "Hiba welfare Breakfast"],
    ["meat-distribution", "Meat Distribution"],
    ["mobile-dastarkhwan", "Mobile Dastarkhwan"],
    ["mezban", "Mezban Hiba welfare"],
    ["roti-bank", "Roti Bank"],
  ]),
  menuSection("social-welfare", "Social Welfare", [
    ["kafalat-program", "Kafalat Program"],
    ["wedding-support", "Wedding Support"],
    ["apna-karobaar", "Apna Karobaar"],
    ["job-bank", "Job Bank"],
    ["laptop-financing", "Laptop Financing"],
    ["housing", "Housing"],
  ]),
  menuSection("sadiqah-jariah", "Sadiqah Jariah", [
    ["construction-of-masajid", "Construction of Masajid"],
    ["clean-drinking-water", "Clean Drinking Water"],
    ["plantation", "Plantation"],
  ]),
  menuSection("disaster-aid", "Disaster Aid", [
    ["corona-relief", "Corona Relief"],
    ["rain-relief", "Rain Relief"],
    ["fire-fighting-rescue", "Fire Fighting & Rescue"],
  ]),
  menuSection("ehsaas", "Hiba welfare Ehsaas", [
    ["langar-khana", "Langar Khana"],
    ["panah-gaah", "Panah Gaah"],
    ["koi-bhooka-na-soyega", "Koi Bhooka Na Soyega"],
  ]),
]

export const DEFAULTS: SiteSettingsData = {
  home: {
    heading: "HIBA WELFARE SOCIETY",
    tagline: "CHANGING LIVES, BUILDING A BETTER TOMORROW",
    description:
      "Hiba Welfare Society is a non-profit organization dedicated to uplifting communities and empowering individuals through compassion, care and commitment.",
  },
  about: {
    title: "Chairman's Message",
    chairmanName: "Muhammad Bashir Farooqi",
    chairmanRole: "Chairman, Hiba Welfare Society",
    greeting: "Assalam-o-Alaikum,",
    message:
      "It should be noted that Allah, who is in need of no one and nothing, instills upon His men to give Qarz-e-Hasana because it is in man's nature to be frugal while spending his wealth.",
  },
  services: {
    visible: true,
    title: "Services",
    intro: "Health, education, food and welfare programs published on the services page.",
    items: [
      "Blood Bank & Thalassemia Center",
      "Mobile Healthcare Clinic",
      "Medical Equipment",
      "Hijama (Cupping Therapy)",
      "Laboratory Facility",
      "X-Rays and Ultrasound",
      "Mother & Child Care Center",
      "Hiba Welfare Schooling System",
      "Hiba Welfare Mass IT Training (SMIT)",
      "Online Quran Academy",
      "Hiba Welfare Dastarkhwan",
      "Hiba Welfare Roti Bank",
      "Ration Support",
      "Kafalat Program",
      "Housing Support",
      "Clean Drinking Water",
    ],
    menu: DEFAULT_SERVICE_MENU,
  },
  media: {
    visible: true,
    title: "Media",
    news: [
      "Maulana Bashir Farooq Qadri reaches among flood victims in Khyber",
      "A Heartfelt Visit of Saad Afridi CEO of Scents N Stories",
      "Javed Alam Odho, Additional IG Karachi, at Hiba Welfare Head Office",
      "Hiba Welfare Mega IT Exam 2025",
    ],
    videos: [
      "Maulana Abdul Habib Attari Visits Hiba Welfare Zaitoon Ashraf IT Park",
      "Hiba Welfare Welfare Trust & KAACIB Job Fair",
      "Khyber Pakhtunkhwa Floods - Hiba Welfare Relief Report",
    ],
    menuNews: { visible: true, label: "News", description: "Recent news" },
    menuVideos: { visible: true, label: "Videos", description: "Video gallery" },
  },
  donate: {
    visible: true,
    title: "Donate",
    description: "Choose a cause and support Hiba Welfare Society.",
  },
  contact: {
    visible: true,
    title: "Contact Us",
    email: "hibawelfaresociety@gmail.com",
    phones: "0345-4906001\n0321-6703735",
    address: "4th Floor, Shamim Square, Nazd Shezan Bakery, Main Market, Gulberg II, Lahore, Pakistan",
  },
  bank: {
    visible: true,
    title: "Bank Details",
    bankName: "Faysal Bank",
    bankSubtitle: "Faysal Bank Limited",
    accountTitle: "Hiba Welfare Society",
    accountNumber: "3395499000002377",
    iban: "PK83FAYS3395499000002377",
  },
  donateNow: {
    visible: true,
    label: "DONATE NOW",
  },
  footer: {
    brandName: "Hiba Welfare",
    brandText:
      "Hiba Welfare Society is dedicated to uplifting the impoverished through comprehensive support services including food, health, and education.",
    donationCategories: [
      navLink("ramzan-2026", "Ramzan 2026", "/donate/ramzan-donation-2026"),
      navLink("sadqa-jariah", "Sadqa e Jariah", "/donate/sadqa-jariah"),
      navLink("sadqah-aqiqah", "Sadqa / Aqiqah Animal", "/donate/sadqah-aqiqah-animal"),
      navLink("food-donation", "Food Donation", "/donate/food-assistance"),
      navLink("education", "Education", "/donate/education-fund"),
      navLink("medical", "Medical & Healthcare", "/donate/medical-program"),
    ],
  },
  stickyBar: {
    visible: true,
    links: [
      navLink("sehri-iftari", "Ramadan Sehri & Iftari", "/donate/ramzan-donation-2026"),
      navLink("ramadan-ration", "Ramadan Ration", "/donate/ramzan-donation-2026"),
      navLink("zakat", "Zakat", "/donate/zakat-support-fund"),
    ],
  },
}

export function mergeSettings(parsed: Partial<SiteSettingsData>): SiteSettingsData {
  return {
    home: { ...DEFAULTS.home, ...parsed.home },
    about: { ...DEFAULTS.about, ...parsed.about },
    services: {
      ...DEFAULTS.services,
      ...parsed.services,
      items: Array.isArray(parsed.services?.items) ? parsed.services.items : DEFAULTS.services.items,
      menu:
        Array.isArray(parsed.services?.menu) && parsed.services.menu.length > 0
          ? parsed.services.menu
          : DEFAULTS.services.menu,
      visible: parsed.services?.visible !== false,
    },
    media: {
      ...DEFAULTS.media,
      ...parsed.media,
      news: Array.isArray(parsed.media?.news) ? parsed.media.news : DEFAULTS.media.news,
      videos: Array.isArray(parsed.media?.videos) ? parsed.media.videos : DEFAULTS.media.videos,
      menuNews: { ...DEFAULTS.media.menuNews, ...parsed.media?.menuNews },
      menuVideos: { ...DEFAULTS.media.menuVideos, ...parsed.media?.menuVideos },
      visible: parsed.media?.visible !== false,
    },
    donate: {
      ...DEFAULTS.donate,
      ...parsed.donate,
      visible: parsed.donate?.visible !== false,
    },
    contact: {
      ...DEFAULTS.contact,
      ...parsed.contact,
      visible: parsed.contact?.visible !== false,
    },
    bank: {
      ...DEFAULTS.bank,
      ...parsed.bank,
      visible: parsed.bank?.visible !== false,
    },
    donateNow: {
      ...DEFAULTS.donateNow,
      ...parsed.donateNow,
      visible: parsed.donateNow?.visible !== false,
    },
    footer: {
      ...DEFAULTS.footer,
      ...parsed.footer,
      donationCategories:
        Array.isArray(parsed.footer?.donationCategories) && parsed.footer.donationCategories.length > 0
          ? parsed.footer.donationCategories
          : DEFAULTS.footer.donationCategories,
    },
    stickyBar: {
      ...DEFAULTS.stickyBar,
      ...parsed.stickyBar,
      links:
        Array.isArray(parsed.stickyBar?.links) && parsed.stickyBar.links.length > 0
          ? parsed.stickyBar.links
          : DEFAULTS.stickyBar.links,
      visible: parsed.stickyBar?.visible !== false,
    },
  }
}
