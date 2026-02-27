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
  codeStatus: 'pending' | 'used' | 'expired'
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
