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

export interface InvitationCode {
  id: string
  code: string
  unitId: string
  expiresAt: string
  codeStatus: 'pending' | 'used' | 'expired'
  createdAt: string
}

export interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  unitNumber: string
  blockName: string | null
  applicationStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Member {
  userId: string
  fullName: string
  email: string
  role: UserRole
  status: MemberStatus
  unitNumber: string | null
  blockName: string | null
}
