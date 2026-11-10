export type PaymentRow = {
  orderRef: string
  status: string
  publicStatus: string
  amountPkr: number
  currency: string
  donorName: string
  donorEmail: string
  donorPhone: string
  category: string
  transactionId: string
  senderName: string
  senderPhone: string
  notes: string
  gateway: string
  adminNote: string
  rejectionCode: string
  rejectionReason: string
  infoRequest: string
  approvedBy: string
  rejectedBy: string
  createdAt: string | null
  submittedAt: string | null
  verifiedAt: string | null
  bankDetails?: Record<string, unknown> | null
  donationMeta?: Record<string, unknown> | null
}

export type DonorRow = {
  email: string
  name: string
  phone: string
  totalCount: number
  totalAmount: number
  approvedAmount: number
  pendingCount: number
  rejectedCount: number
  lastDonation: string | null
}

export type AdminStats = {
  totalCount: number
  totalAmount: number
  pendingCount: number
  pendingAmount: number
  approvedCount: number
  approvedAmount: number
  rejectedCount: number
  rejectedAmount: number
  todayAmount: number
  monthAmount: number
  yearAmount: number
  donorCount: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  recent: PaymentRow[]
}

export type NavId =
  | "dashboard"
  | "donations"
  | "donors"
  | "categories"
  | "programs"
  | "campaigns"
  | "payments"
  | "beneficiaries"
  | "reports"
  | "content"
  | "notifications"
  | "users"
  | "audit"
  | "site-settings"
  | "settings"
