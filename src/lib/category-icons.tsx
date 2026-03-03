import {
  Zap, Droplet, Flame, Sparkles, Shield, ArrowUpDown, Trees, Waves,
  ShieldCheck, Users, Wrench, Briefcase, Landmark, CircleDot, PiggyBank,
  Building, Percent, AlertTriangle, FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  droplet: Droplet,
  flame: Flame,
  sparkles: Sparkles,
  shield: Shield,
  'arrow-up-down': ArrowUpDown,
  trees: Trees,
  waves: Waves,
  'shield-check': ShieldCheck,
  users: Users,
  wrench: Wrench,
  briefcase: Briefcase,
  landmark: Landmark,
  'circle-dot': CircleDot,
  'piggy-bank': PiggyBank,
  building: Building,
  percent: Percent,
  'alert-triangle': AlertTriangle,
}

interface CategoryIconProps {
  name: string | null
  className?: string
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = name ? iconMap[name] : null
  if (!Icon) return <FolderOpen className={cn('w-4 h-4', className)} />
  return <Icon className={cn('w-4 h-4', className)} />
}

// Chart renkleri — index.css'teki --chart-1..--chart-5 token'larına karşılık gelir
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
]
