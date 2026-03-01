export type UserRole = 'admin' | 'board_member' | 'resident' | 'staff'
export type MemberStatus = 'active' | 'suspended' | 'removed'
export type OrgType = 'site' | 'apartment'
export type OrgStatus = 'active' | 'inactive'

export interface UserProfile {
  id: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
}

export interface MembershipUnit {
  unitId: string
  unitNumber: string
  blockName: string | null
  residentType: string
}

export interface Membership {
  organizationId: string
  organizationName: string
  role: UserRole
  status: MemberStatus
  units: MembershipUnit[]
}

export interface Organization {
  id: string
  name: string
  orgType: OrgType
  status: OrgStatus
  addressDistrict: string | null
  addressCity: string | null
  contactPhone: string | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface InvitationCode {
  invitationId: string
  invitationCode: string
  unitNumber: string
  blockName: string | null
  codeStatus: 'active' | 'used' | 'expired'
  applicationStatus: string | null
  expiresAt: string
  createdAt: string
}

export interface Application {
  applicationId: string
  applicantName: string
  applicantPhone: string | null
  unitNumber: string
  blockName: string | null
  residentType: string
  submittedAt: string
  duplicateWarning: boolean
}

export interface Member {
  userId: string
  fullName: string
  phone: string | null
  role: UserRole
  status: MemberStatus
  units: { unitNumber: string; blockName: string | null }[]
  joinedAt: string
}

export type UnitType = 'residential' | 'shop' | 'storage' | 'parking' | 'other'
export type BlockType = 'residential' | 'commercial' | 'mixed'

export interface Block {
  id: string
  organizationId: string
  name: string
  blockType: BlockType
  isDefault: boolean
  unitCount: number
  createdAt: string
}

export interface Unit {
  id: string
  blockId: string
  blockName: string
  unitNumber: string
  unitType: UnitType
  floor: number | null
  areaSqm: number | null
  notes: string | null
  isOccupied: boolean
  createdAt: string
}

export interface UnitDropdownItem {
  id: string
  blockId: string
  blockName: string
  unitNumber: string
  isOccupied: boolean
}

export interface BulkCreateResult {
  created: number
  skipped: number
  skippedNumbers: string[]
}

// ─── Aidat (Dues) Tipleri ────────────────────────────────────────────────────

export interface DueType {
  id: string
  organizationId: string
  name: string
  description: string | null
  defaultAmount: number
  categoryAmounts: string | null  // JSON string: {"small":500,"large":600}
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DuesPeriodListItem {
  id: string
  name: string
  startDate: string   // "2026-03-01"
  dueDate: string
  status: 'draft' | 'processing' | 'active' | 'failed' | 'closed'
  totalDues: number
  paidCount: number
  pendingCount: number
  totalAmount: number
  collectedAmount: number
  createdAt: string
}

export interface DuesPeriod {
  id: string
  organizationId: string
  name: string
  startDate: string
  dueDate: string
  status: 'draft' | 'processing' | 'active' | 'failed' | 'closed'
  createdBy: string
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export type UnitDueStatus = 'pending' | 'partial' | 'paid' | 'cancelled'

export interface UnitDueListItem {
  id: string
  unitId: string
  unitNumber: string
  blockName: string
  residentName: string | null
  unitCategory: string | null
  dueTypeId: string
  dueTypeName: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: UnitDueStatus
  isOverdue: boolean
  createdAt: string
}

export interface DuesPeriodDetailResult {
  period: DuesPeriod
  items: UnitDueListItem[]
  totalCount: number
}

export interface AccrualCategoryLine {
  category: string | null
  amount: number
  unitCount: number
  subtotal: number
}

export interface AccrualPreviewLine {
  dueTypeId: string
  dueTypeName: string
  categoryLines: AccrualCategoryLine[]
  unitsWithoutCategory: number
  subtotal: number
}

export interface AccrualPreview {
  totalUnits: number
  occupiedUnits: number
  emptyUnits: number
  includedUnits: number
  dueTypeBreakdowns: AccrualPreviewLine[]
  unitsWithoutCategory: number
  totalAmount: number
}

export interface PaymentListItem {
  id: string
  receiptNumber: string
  amount: number
  paidAt: string
  paymentMethod: string
  collectedByName: string | null
  isOverpayment: boolean
  overpaymentAmount: number | null
  note: string | null
  createdAt: string
}

export interface PaymentHistoryItem {
  id: string
  receiptNumber: string
  amount: number
  paidAt: string
  paymentMethod: string
  collectedByName: string | null
  periodName: string
  dueTypeName: string
  unitNumber: string
  blockName: string
  createdAt: string
}

export interface DuesSummary {
  activePeriods: number
  totalPendingDues: number
  totalPendingAmount: number
  totalCollectedAmount: number
  overdueDues: number
}

export interface OrganizationDueSettings {
  organizationId: string
  lateFeeRate: number
  lateFeeGraceDays: number
  reminderDaysBefore: number
}

export interface UnitDueResidentItem {
  id: string
  periodName: string
  dueDate: string
  dueTypeName: string
  amount: number
  paidAmount: number
  status: UnitDueStatus
  isOverdue: boolean
  calculatedLateFee: number | null
  createdAt: string
}
