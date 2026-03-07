import type { AgendaStatus, AgendaCategory } from '@/types'

export const agendaStatusConfig: Record<AgendaStatus, { label: string; class: string }> = {
  acik:               { label: 'Acik',              class: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  degerlendiriliyor:  { label: 'Degerlendiriliyor', class: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  oylamada:           { label: 'Oylamada',          class: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  kararlasti:         { label: 'Kararlasti',        class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  kapali:             { label: 'Kapali',            class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
}

export const agendaCategoryConfig: Record<AgendaCategory, { label: string; class: string }> = {
  genel:        { label: 'Genel',        class: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-500/10 dark:text-gray-400' },
  bakim_onarim: { label: 'Bakim/Onarim', class: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400' },
  guvenlik:     { label: 'Guvenlik',     class: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-500/10 dark:text-red-400' },
  sosyal:       { label: 'Sosyal',       class: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-500/10 dark:text-purple-400' },
  finansal:     { label: 'Finansal',     class: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' },
  yonetim:      { label: 'Yonetim',      class: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-400' },
}

export const agendaValidTransitions: Record<string, string[]> = {
  acik:              ['degerlendiriliyor', 'kapali'],
  degerlendiriliyor: ['acik', 'oylamada', 'kararlasti', 'kapali'],
  oylamada:          ['kararlasti', 'kapali'],
}

export function getAgendaNextStatuses(current: string): string[] {
  return agendaValidTransitions[current] ?? []
}
