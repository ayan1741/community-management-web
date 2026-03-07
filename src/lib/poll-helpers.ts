import type { PollStatus, PollType, DecisionStatus, MeetingStatus } from '@/types'

export const pollStatusConfig: Record<PollStatus, { label: string; class: string }> = {
  aktif:   { label: 'Aktif',   class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  kapandi: { label: 'Kapandi', class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
  iptal:   { label: 'Iptal',   class: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
}

export const pollTypeLabels: Record<PollType, string> = {
  evet_hayir:     'Evet/Hayir',
  coktan_secmeli: 'Coktan Secmeli',
}

export const decisionStatusConfig: Record<DecisionStatus, { label: string; class: string }> = {
  karar_alindi: { label: 'Karar Alindi', class: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  uygulamada:   { label: 'Uygulamada',   class: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  tamamlandi:   { label: 'Tamamlandi',   class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  iptal:        { label: 'Iptal',        class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
}

export const meetingStatusConfig: Record<MeetingStatus, { label: string; class: string }> = {
  planlanmis: { label: 'Planlanmis', class: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  tamamlandi: { label: 'Tamamlandi', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  iptal:      { label: 'Iptal',      class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
}
