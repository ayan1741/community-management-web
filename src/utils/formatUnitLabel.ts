import type { OrgType } from '@/types'

export function formatUnitLabel(
  blockName: string | null,
  unitNumber: string,
  orgType: OrgType
): string {
  if (orgType === 'apartment') return unitNumber
  return blockName ? `${blockName} / ${unitNumber}` : unitNumber
}
