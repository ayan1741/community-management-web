import type { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '@/types'

// ─── Status ─────────────────────────────────────────────────────────────

export const statusConfig: Record<MaintenanceStatus, { label: string; class: string }> = {
  reported:    { label: 'Bildirildi',  class: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  in_review:   { label: 'Inceleniyor', class: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  assigned:    { label: 'Atandi',      class: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  in_progress: { label: 'Islemde',     class: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400' },
  resolved:    { label: 'Cozuldu',     class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  closed:      { label: 'Kapatildi',   class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
  cancelled:   { label: 'Iptal',       class: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
}

// ─── Priority ───────────────────────────────────────────────────────────

export const priorityConfig: Record<MaintenancePriority, { label: string; class: string }> = {
  dusuk:  { label: 'Dusuk',  class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
  normal: { label: 'Normal', class: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800' },
  yuksek: { label: 'Yuksek', class: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800' },
  acil:   { label: 'Acil',   class: 'bg-red-100 text-red-700 border border-red-300 font-semibold dark:bg-red-500/10 dark:text-red-400 dark:border-red-800' },
}

// ─── Category ───────────────────────────────────────────────────────────

export const categoryConfig: Record<MaintenanceCategory, { label: string }> = {
  elektrik:       { label: 'Elektrik' },
  su_tesisati:    { label: 'Su Tesisati' },
  asansor:        { label: 'Asansor' },
  ortak_alan:     { label: 'Ortak Alan' },
  boya_badana:    { label: 'Boya/Badana' },
  isitma_sogutma: { label: 'Isitma/Sogutma' },
  guvenlik:       { label: 'Guvenlik' },
  diger:          { label: 'Diger' },
}

// ─── Location Type ──────────────────────────────────────────────────────

export const locationTypeLabels: Record<string, string> = {
  unit: 'Daire',
  common_area: 'Ortak Alan',
}

// ─── Valid Status Transitions ───────────────────────────────────────────

export const validTransitions: Record<string, string[]> = {
  reported:    ['in_review', 'cancelled'],
  in_review:   ['assigned', 'reported', 'cancelled'],
  assigned:    ['in_progress', 'in_review', 'cancelled'],
  in_progress: ['resolved', 'assigned', 'cancelled'],
  resolved:    ['closed', 'in_progress'],
}

export function getNextStatuses(current: string): string[] {
  return validTransitions[current] ?? []
}

// ─── Photo URL helpers ──────────────────────────────────────────────────

export function parsePhotoUrls(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // pipe-delimited fallback
    return raw.split('|').filter(Boolean)
  }
}
