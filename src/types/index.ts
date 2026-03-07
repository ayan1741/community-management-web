export type UserRole = 'admin' | 'board_member' | 'resident' | 'staff'
export type MemberStatus = 'active' | 'suspended' | 'removed'
export type OrgType = 'site' | 'apartment'
export type OrgStatus = 'active' | 'inactive'

export interface UserProfile {
  id: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  kvkkConsentAt: string | null
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
  orgType: OrgType
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

// ─── Gelir-Gider (Finance) Tipleri ──────────────────────────────────────

export type ReportBasis = 'period' | 'cash'

export interface FinanceCategoryTreeItem {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string | null
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  children: FinanceCategoryTreeItem[]
}

export interface FinanceRecordListItem {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  type: 'income' | 'expense'
  amount: number
  recordDate: string
  periodYear: number
  periodMonth: number
  description: string
  paymentMethod: string | null
  documentUrl: string | null
  isOpeningBalance: boolean
  createdByName: string
  createdAt: string
}

export interface FinanceRecordListResult {
  items: FinanceRecordListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export interface FinanceRecord {
  id: string
  organizationId: string
  categoryId: string
  type: 'income' | 'expense'
  amount: number
  recordDate: string
  periodYear: number
  periodMonth: number
  description: string
  paymentMethod: string | null
  documentUrl: string | null
  isOpeningBalance: boolean
  createdBy: string
  createdAt: string
}

export interface BudgetWithCategoryItem {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  year: number
  month: number
  amount: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  parentCategoryName: string | null
  amount: number
  percentage: number
}

export interface MonthAmountItem {
  year: number
  month: number
  amount: number
}

export interface MonthlyReportResult {
  year: number
  month: number
  duesCollected: number
  otherIncome: number
  totalIncome: number
  totalExpense: number
  netBalance: number
  previousMonthExpense: number | null
  changePercent: number | null
  expenseBreakdown: CategoryBreakdownItem[]
  incomeBreakdown: CategoryBreakdownItem[]
  recentRecords: FinanceRecordListItem[]
}

export interface AnnualMonthRow {
  year: number
  month: number
  duesCollected: number
  otherIncome: number
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export interface AnnualCategoryTotal {
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  type: string
  annualTotal: number
}

export interface AnnualReportResult {
  year: number
  monthlyTotals: AnnualMonthRow[]
  yearTotalIncome: number
  yearTotalExpense: number
  yearNetBalance: number
  yearDuesCollected: number
  categoryTotals: AnnualCategoryTotal[]
}

export interface BudgetComparisonItem {
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  budgetAmount: number
  actualAmount: number
  difference: number
  differencePercent: number
  status: 'under_budget' | 'warning' | 'over_budget' | null
}

export interface BudgetVsActualResult {
  items: BudgetComparisonItem[]
  totalBudget: number
  totalActual: number
  totalDifference: number
}

export interface ResidentFinanceSummaryResult {
  year: number
  month: number
  duesCollected: number
  otherIncome: number
  totalIncome: number
  totalExpense: number
  netBalance: number
  expenseBreakdown: CategoryBreakdownItem[]
  activeUnitCount: number
  perUnitShare: number
  expenseTrend: MonthAmountItem[]
}

// ─── Duyuru (Announcement) Tipleri ──────────────────────────────────────

export type AnnouncementCategory = 'general' | 'urgent' | 'maintenance' | 'meeting' | 'financial' | 'other'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'
export type AnnouncementStatus = 'draft' | 'published' | 'expired'
export type AnnouncementTargetType = 'all' | 'block' | 'role'

export interface AttachmentInfo {
  url: string
  name: string
  size: number
}

export interface AnnouncementListItem {
  id: string
  title: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  status: AnnouncementStatus
  isPinned: boolean
  createdByName: string
  publishedAt: string | null
  createdAt: string
  isRead: boolean
  totalCount: number
}

export interface AnnouncementDetail {
  id: string
  organizationId: string
  title: string
  body: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  targetType: AnnouncementTargetType
  targetIds: string | null
  status: AnnouncementStatus
  isPinned: boolean
  publishedAt: string | null
  expiresAt: string | null
  attachmentUrls: string | null
  targetMemberCount: number | null
  createdByName: string
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
  isRead: boolean
}

export interface AnnouncementReadItem {
  userId: string
  fullName: string
  readAt: string
}

export interface AnnouncementUnreadItem {
  userId: string
  fullName: string
}

export interface AnnouncementReadsResult {
  targetMemberCount: number
  readCount: number
  readPercentage: number
  readers: AnnouncementReadItem[] | null
  readersTotal: number
  nonReaders: AnnouncementUnreadItem[] | null
  nonReadersTotal: number
}

export interface AnnouncementsListResult {
  items: AnnouncementListItem[]
  totalCount: number
  page: number
  pageSize: number
}

// ─── Ariza Bildirimi (Maintenance Request) Tipleri ──────────────────────────

export type MaintenanceCategory = 'elektrik' | 'su_tesisati' | 'asansor' | 'ortak_alan' | 'boya_badana' | 'isitma_sogutma' | 'guvenlik' | 'diger'
export type MaintenancePriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'
export type MaintenanceStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
export type MaintenanceLocationType = 'unit' | 'common_area'

export interface MaintenanceRequestListItem {
  id: string
  title: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  locationType: MaintenanceLocationType
  locationNote: string | null
  reportedByName: string
  photoCount: number
  isRecurring: boolean
  slaBreached: boolean
  createdAt: string
  totalCount: number
}

export interface MaintenanceRequestListResult {
  items: MaintenanceRequestListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export interface MaintenanceRequestDetail {
  id: string
  organizationId: string
  title: string
  description: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  locationType: MaintenanceLocationType
  unitId: string | null
  unitLabel: string | null
  locationNote: string | null
  assigneeName: string | null
  assigneePhone: string | null
  assigneeNote: string | null
  assignedAt: string | null
  totalCost: number
  isRecurring: boolean
  satisfactionRating: number | null
  satisfactionComment: string | null
  ratedAt: string | null
  slaDeadlineAt: string | null
  slaBreached: boolean
  photoUrls: string | null
  reportedByName: string
  reportedBy: string
  resolvedAt: string | null
  closedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRequestLogItem {
  id: string
  fromStatus: string | null
  toStatus: string
  note: string | null
  createdByName: string
  createdAt: string
}

export interface MaintenanceRequestCommentItem {
  id: string
  content: string
  photoUrl: string | null
  createdByName: string
  createdBy: string
  createdAt: string
}

export interface MaintenanceRequestCostItem {
  id: string
  amount: number
  description: string | null
  financeRecordId: string | null
  createdByName: string
  createdAt: string
}

export interface MaintenanceRequestDetailResult {
  detail: MaintenanceRequestDetail
  timeline: MaintenanceRequestLogItem[]
  comments: MaintenanceRequestCommentItem[]
  costs: MaintenanceRequestCostItem[] | null
}

export interface MaintenanceRequestStats {
  totalOpen: number
  totalResolved: number
  totalClosed: number
  slaBreachedCount: number
  recurringCount: number
  totalCostSum: number
}

// ─── Bildirim (Notification) Tipleri ──────────────────────────────────────

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string | null
  referenceType: string | null
  referenceId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  totalCount: number
}

export interface NotificationsListResult {
  items: NotificationItem[]
  totalCount: number
  page: number
  pageSize: number
}
