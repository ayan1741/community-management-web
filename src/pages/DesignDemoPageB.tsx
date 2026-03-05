import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  Users, CircleDollarSign, CalendarDays, TrendingUp,
  TrendingDown, Megaphone, BarChart3, Building2,
  Search, Plus, Filter, ChevronLeft,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertTriangle, XCircle,
  Bell, Mail, Settings, DoorOpen,
  Inbox, Eye, Edit2, Trash2, Download,
  RefreshCw, Wrench, Zap, Shield,
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts'

// ── Mock Data ──────────────────────────────────────────

const mockBarData = [
  { month: 'Oca', gelir: 12500, gider: 8200 },
  { month: 'Şub', gelir: 14200, gider: 9100 },
  { month: 'Mar', gelir: 11800, gider: 7600 },
  { month: 'Nis', gelir: 15600, gider: 10400 },
  { month: 'May', gelir: 13900, gider: 8800 },
  { month: 'Haz', gelir: 16200, gider: 11500 },
]

const mockPieData = [
  { name: 'Temizlik', value: 4200 },
  { name: 'Güvenlik', value: 3800 },
  { name: 'Bakım', value: 2500 },
  { name: 'Enerji', value: 1900 },
]

const mockAreaData = [
  { month: 'Oca', tahsilat: 82 },
  { month: 'Şub', tahsilat: 78 },
  { month: 'Mar', tahsilat: 85 },
  { month: 'Nis', tahsilat: 91 },
  { month: 'May', tahsilat: 88 },
  { month: 'Haz', tahsilat: 94 },
]

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const mockMembers = [
  { id: 1, name: 'Ahmet Yılmaz', unit: 'A-101', role: 'admin', status: 'active', phone: '532 xxx xx xx', joinedAt: '2024-01-15' },
  { id: 2, name: 'Fatma Kaya', unit: 'B-203', role: 'resident', status: 'active', phone: '545 xxx xx xx', joinedAt: '2024-02-20' },
  { id: 3, name: 'Mehmet Demir', unit: 'C-305', role: 'resident', status: 'active', phone: '555 xxx xx xx', joinedAt: '2024-03-10' },
  { id: 4, name: 'Ayşe Çelik', unit: 'A-102', role: 'board_member', status: 'active', phone: '538 xxx xx xx', joinedAt: '2024-01-18' },
  { id: 5, name: 'Ali Öztürk', unit: 'B-201', role: 'resident', status: 'pending', phone: '542 xxx xx xx', joinedAt: '2024-04-05' },
]

const mockAnnouncements = [
  { id: 1, title: 'Asansör bakım çalışması', category: 'maintenance', date: '2 saat önce', read: 45 },
  { id: 2, title: 'Haziran ayı aidat hatırlatması', category: 'financial', date: '1 gün önce', read: 82 },
  { id: 3, title: 'Bahçe düzenleme toplantısı', category: 'general', date: '3 gün önce', read: 61 },
  { id: 4, title: 'Su kesintisi bildirimi', category: 'urgent', date: '5 gün önce', read: 120 },
]

const roleLabels: Record<string, string> = {
  admin: 'Yönetici',
  board_member: 'Yönetim Kurulu',
  resident: 'Sakin',
}

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Aktif', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  pending: { label: 'Bekliyor', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  inactive: { label: 'Pasif', class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400' },
}

const categoryConfig: Record<string, { label: string; class: string }> = {
  maintenance: { label: 'Bakım', class: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
  financial: { label: 'Mali', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  general: { label: 'Genel', class: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400' },
  urgent: { label: 'Acil', class: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
}

// ── Gradient Presets ──────────────────────────────────

type GradientKey = 'blue' | 'green' | 'purple' | 'teal' | 'orange' | 'rose'

const gradients: Record<GradientKey, string> = {
  blue: 'from-blue-600 to-blue-400',
  green: 'from-emerald-600 to-emerald-400',
  purple: 'from-purple-600 to-blue-500',
  teal: 'from-teal-600 to-teal-400',
  orange: 'from-orange-500 to-amber-400',
  rose: 'from-rose-600 to-pink-400',
}

// ── Reusable Components (Gradient Style) ──────────────

/** Gradient Section Header — colored gradient bar with white text */
function GradientSectionHeader({
  icon: Icon,
  title,
  subtitle,
  gradient = 'blue',
  actions,
  metric,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  gradient?: GradientKey
  actions?: React.ReactNode
  metric?: { label: string; value: string }
}) {
  return (
    <div className={cn('rounded-t-2xl bg-gradient-to-r px-5 py-4', gradients[gradient])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {metric && (
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-white">{metric.value}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">{metric.label}</p>
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  )
}

/** Stat Card — colorful icon circle, bold value, metric highlight */
function GradientStatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  trend,
  footnote,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  trend?: { value: string; direction: 'up' | 'down' }
  footnote?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconBg)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full',
            trend.direction === 'up'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
          )}>
            {trend.direction === 'up'
              ? <ArrowUpRight className="w-3.5 h-3.5" />
              : <ArrowDownRight className="w-3.5 h-3.5" />
            }
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
      {footnote && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{footnote}</p>
      )}
    </div>
  )
}

/** Metric Highlight Card — colored icon + badge label + value */
function MetricCard({
  icon: Icon,
  iconBg,
  badge,
  badgeClass,
  label,
  value,
}: {
  icon: React.ElementType
  iconBg: string
  badge: string
  badgeClass: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4">
      <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', iconBg)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider', badgeClass)}>
          {badge}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-white/90">{value}</p>
      </div>
    </div>
  )
}

// ── Main Demo Page B ──────────────────────────────────

export function DesignDemoPageB() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1: Page Header Örnekleri
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Page Header Örnekleri (Gradient)
            </h2>
          </div>

          {/* Variant 1: Blue gradient */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <GradientSectionHeader
              icon={Users}
              title="Üye Yönetimi"
              subtitle="Site sakinlerini görüntüle, düzenle ve yönet"
              gradient="blue"
              metric={{ label: 'Toplam Üye', value: '142' }}
              actions={
                <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Yeni Üye
                </Button>
              }
            />
            <div className="bg-white dark:bg-white/[0.03] p-6">
              <p className="text-sm text-muted-foreground">Sayfa içeriği burada...</p>
            </div>
          </div>

          {/* Variant 2: Green gradient with metric */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <GradientSectionHeader
              icon={CircleDollarSign}
              title="Gelir-Gider Yönetimi"
              subtitle="Mali kayıtları takip edin, bütçe planlayın"
              gradient="green"
              metric={{ label: 'Net Bakiye', value: '₺35.450' }}
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Download className="w-4 h-4 mr-1.5" />
                    Dışa Aktar
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Kayıt Ekle
                  </Button>
                </div>
              }
            />
            <div className="bg-white dark:bg-white/[0.03] p-6">
              <p className="text-sm text-muted-foreground">Sayfa içeriği burada...</p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2: Stat / KPI Kartları
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stat / KPI Kartları (Renkli İkon)
            </h2>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <GradientStatCard
              icon={Users}
              iconBg="bg-blue-500"
              label="Toplam Üye"
              value="142"
              trend={{ value: '+12%', direction: 'up' }}
              footnote="Son 30 gün"
            />
            <GradientStatCard
              icon={CircleDollarSign}
              iconBg="bg-emerald-500"
              label="Toplam Tahsilat"
              value="₺48.250"
              trend={{ value: '+8.5%', direction: 'up' }}
              footnote="Bu dönem"
            />
            <GradientStatCard
              icon={Clock}
              iconBg="bg-orange-500"
              label="Bekleyen Borç"
              value="₺12.800"
              trend={{ value: '-3.2%', direction: 'down' }}
              footnote="Geçen aya göre"
            />
            <GradientStatCard
              icon={Megaphone}
              iconBg="bg-purple-500"
              label="Aktif Duyuru"
              value="8"
              footnote="3 tanesi bu hafta"
            />
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GradientStatCard
              icon={Building2}
              iconBg="bg-teal-500"
              label="Toplam Daire"
              value="96"
              footnote="3 blok"
            />
            <GradientStatCard
              icon={CalendarDays}
              iconBg="bg-indigo-500"
              label="Aktif Dönem"
              value="2"
              trend={{ value: 'Normal', direction: 'up' }}
            />
            <GradientStatCard
              icon={TrendingUp}
              iconBg="bg-rose-500"
              label="Net Bakiye"
              value="₺35.450"
              trend={{ value: '+15%', direction: 'up' }}
              footnote="Gelir - Gider"
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3: Veri Tablosu (Gradient Header)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Veri Tablosu (Gradient Header)
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <GradientSectionHeader
              icon={Users}
              title="Üye Listesi"
              subtitle="142 kayıt"
              gradient="blue"
              actions={
                <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              }
            />

            {/* Search & filter bar */}
            <div className="bg-white dark:bg-white/[0.03]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Üye ara..." className="pl-8 h-8 w-48 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Filtre
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Dışa Aktar
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Üye</TableHead>
                    <TableHead className="font-semibold">Daire</TableHead>
                    <TableHead className="font-semibold">Rol</TableHead>
                    <TableHead className="font-semibold">Durum</TableHead>
                    <TableHead className="font-semibold">Telefon</TableHead>
                    <TableHead className="font-semibold text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMembers.map((member, idx) => (
                    <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 text-xs font-bold">
                          {idx + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                            {member.name.split(' ').map(w => w[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.unit}</TableCell>
                      <TableCell>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          member.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                            : member.role === 'board_member' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400',
                        )}>
                          {roleLabels[member.role] ?? member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                          member.status === 'active'
                            ? 'border-emerald-300 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400'
                            : 'border-amber-300 text-amber-700 dark:border-amber-500/30 dark:text-amber-400',
                        )}>
                          {member.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {statusConfig[member.status]?.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-muted-foreground">Sayfa 1 / 7</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">2</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4: Grafikler (Gradient Headers)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Grafikler (Gradient Header)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart with purple-blue gradient header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader
                icon={BarChart3}
                title="Gelir vs Gider"
                subtitle="Son 6 ay"
                gradient="purple"
              />
              <div className="bg-white dark:bg-white/[0.03] p-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockBarData} barSize={20} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, '']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Bar dataKey="gelir" fill="#10b981" radius={[4, 4, 0, 0]} name="Gelir" />
                      <Bar dataKey="gider" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gider" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Donut Chart with teal gradient header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader
                icon={CircleDollarSign}
                title="Gider Dağılımı"
                subtitle="Kategori bazlı"
                gradient="teal"
              />
              <div className="bg-white dark:bg-white/[0.03] p-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {mockPieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, '']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Area Chart — full width with green gradient header */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader
                icon={TrendingUp}
                title="Tahsilat Oranı Trendi"
                subtitle="Son 6 aylık tahsilat yüzdesi"
                gradient="green"
                metric={{ label: 'Ortalama', value: '%86' }}
              />
              <div className="bg-white dark:bg-white/[0.03] p-5">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockAreaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[60, 100]} tickFormatter={(v) => `%${v}`} />
                      <Tooltip
                        formatter={(value) => [`%${value}`, 'Tahsilat']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tahsilat"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Metric highlight cards below charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              icon={CircleDollarSign}
              iconBg="bg-orange-500"
              badge="Gelir"
              badgeClass="bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
              label="Bu dönem toplam gelir"
              value="₺84.200"
            />
            <MetricCard
              icon={TrendingDown}
              iconBg="bg-blue-500"
              badge="Gider"
              badgeClass="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
              label="Bu dönem toplam gider"
              value="₺55.600"
            />
            <MetricCard
              icon={TrendingUp}
              iconBg="bg-emerald-500"
              badge="Net"
              badgeClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              label="Net kâr/zarar"
              value="₺28.600"
            />
            <MetricCard
              icon={AlertTriangle}
              iconBg="bg-rose-500"
              badge="Risk"
              badgeClass="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
              label="Gecikmiş alacak"
              value="₺12.800"
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 5: Liste / Feed
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Liste / Feed
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Announcements list with gradient header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader
                icon={Megaphone}
                title="Son Duyurular"
                gradient="orange"
                actions={
                  <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                    Tümünü Gör
                  </Button>
                }
              />
              <div className="bg-white dark:bg-white/[0.03] divide-y divide-gray-100 dark:divide-gray-800">
                {mockAnnouncements.map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                      ann.category === 'maintenance' ? 'bg-blue-100 dark:bg-blue-500/15'
                        : ann.category === 'financial' ? 'bg-emerald-100 dark:bg-emerald-500/15'
                        : ann.category === 'urgent' ? 'bg-red-100 dark:bg-red-500/15'
                        : 'bg-gray-100 dark:bg-gray-500/15',
                    )}>
                      <Megaphone className={cn(
                        'w-4 h-4',
                        ann.category === 'maintenance' ? 'text-blue-600 dark:text-blue-400'
                          : ann.category === 'financial' ? 'text-emerald-600 dark:text-emerald-400'
                          : ann.category === 'urgent' ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400',
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          categoryConfig[ann.category]?.class,
                        )}>
                          {categoryConfig[ann.category]?.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{ann.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Eye className="w-3.5 h-3.5" />
                      {ann.read}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed with gradient header */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader
                icon={Bell}
                title="Son Aktiviteler"
                gradient="rose"
                actions={
                  <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                    Tümünü Gör
                  </Button>
                }
              />
              <div className="bg-white dark:bg-white/[0.03] divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { icon: CircleDollarSign, text: 'Ahmet Yılmaz ₺450 ödeme yaptı', time: '5 dk önce', iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: Users, text: 'Fatma Kaya üye olarak eklendi', time: '1 saat önce', iconBg: 'bg-blue-100 dark:bg-blue-500/15', iconColor: 'text-blue-600 dark:text-blue-400' },
                  { icon: AlertTriangle, text: 'B Blok asansör arıza bildirimi', time: '3 saat önce', iconBg: 'bg-amber-100 dark:bg-amber-500/15', iconColor: 'text-amber-600 dark:text-amber-400' },
                  { icon: Mail, text: 'Aidat hatırlatma e-postaları gönderildi', time: '6 saat önce', iconBg: 'bg-purple-100 dark:bg-purple-500/15', iconColor: 'text-purple-600 dark:text-purple-400' },
                  { icon: CheckCircle2, text: 'Haziran dönemi tahakkukları oluşturuldu', time: '1 gün önce', iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', item.iconBg)}>
                      <item.icon className={cn('w-4 h-4', item.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 6: Badge & Status Örnekleri
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Badge & Status Örnekleri (Renkli Dolgu)
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <div className="space-y-6">
              {/* Filled category badges */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Kategori Badge (Dolgu)</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    Bakım
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    Mali
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
                    Toplantı
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400">
                    Acil
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    Uyarı
                  </span>
                </div>
              </div>

              {/* Outline status badges */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Durum Badge (Outline)</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-300 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Aktif
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-300 text-amber-700 dark:border-amber-500/30 dark:text-amber-400">
                    <Clock className="w-3 h-3" /> Bekliyor
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-300 text-red-700 dark:border-red-500/30 dark:text-red-400">
                    <XCircle className="w-3 h-3" /> Reddedildi
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-300 text-blue-700 dark:border-blue-500/30 dark:text-blue-400">
                    <AlertTriangle className="w-3 h-3" /> Bilgi
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
                    Taslak
                  </span>
                </div>
              </div>

              {/* Trend indicators */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Trend Göstergeleri</p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" /> +12.5%
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400">
                    <TrendingDown className="w-4 h-4" /> -3.2%
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500">
                    0% Değişim yok
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 7: Hızlı Erişim / Link Grid (Renkli)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Hızlı Erişim Grid (Renkli İkonlar)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Üyeler', icon: Users, bg: 'bg-blue-500' },
              { label: 'Daireler', icon: DoorOpen, bg: 'bg-teal-500' },
              { label: 'Aidat', icon: CircleDollarSign, bg: 'bg-emerald-500' },
              { label: 'Dönemler', icon: CalendarDays, bg: 'bg-indigo-500' },
              { label: 'Gelir-Gider', icon: BarChart3, bg: 'bg-orange-500' },
              { label: 'Duyurular', icon: Megaphone, bg: 'bg-purple-500' },
            ].map(link => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              >
                <div className={cn('w-11 h-11 rounded-full flex items-center justify-center', link.bg)}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 8: Empty State (Zengin)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Boş Durum (Zengin Empty State)
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              {/* Large circular icon */}
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Henüz kayıt bulunamadı</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Başlamak için yeni bir kayıt ekleyin veya mevcut verilerinizi içe aktarın.
                Eklediğiniz kayıtlar burada listelenecektir.
              </p>
              {/* Two CTA buttons */}
              <div className="flex items-center gap-3 mt-6">
                <Button>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Yeni Kayıt Ekle
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-1.5" />
                  İçe Aktar
                </Button>
              </div>
            </div>

            {/* Feature cards grid */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Hızlı Başlangıç</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tek tıkla kayıt ekleyin ve düzenlemeye başlayın.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Güvenli Veri</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tüm verileriniz şifreli ve güvenli bir şekilde saklanır.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Kolay Yönetim</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sezgisel arayüz ile kolay düzenleme ve takip.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 9: Loading Skeleton
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Loading Skeleton
            </h2>
          </div>

          {/* Stat card skeletons with colored circles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {['bg-blue-200', 'bg-emerald-200', 'bg-orange-200', 'bg-purple-200'].map((bg, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 animate-pulse">
                <div className={cn('w-12 h-12 rounded-full', bg, 'dark:opacity-30')} />
                <div className="mt-4 space-y-2">
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Table skeleton with gradient header */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
            <div className="h-14 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-blue-700 dark:to-blue-600" />
            <div className="bg-white dark:bg-white/[0.03] p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 10: Form Elemanları
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Form Elemanları
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <GradientSectionHeader
              icon={Settings}
              title="Yeni Kayıt Formu"
              subtitle="Gerekli alanları doldurun"
              gradient="teal"
            />
            <div className="bg-white dark:bg-white/[0.03] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Ad Soyad</label>
                  <Input placeholder="Örn: Ahmet Yılmaz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Telefon</label>
                  <Input placeholder="5XX XXX XX XX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">E-posta</label>
                  <Input type="email" placeholder="ornek@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Daire</label>
                  <Input placeholder="Örn: A-101" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Not</label>
                  <textarea
                    rows={3}
                    placeholder="Opsiyonel açıklama..."
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <Button>Kaydet</Button>
                <Button variant="outline">İptal</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 11: Dashboard Tam Örnek
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dashboard Tam Örnek (Tüm Bileşenler Bir Arada)
            </h2>
          </div>

          {/* Page header — gradient */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <GradientSectionHeader
              icon={BarChart3}
              title="Genel Bakış"
              subtitle="Site yönetimi özet paneli"
              gradient="blue"
              metric={{ label: 'Dönem', value: 'Mart 2026' }}
            />
            <div className="bg-white dark:bg-white/[0.03] p-1" />
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <GradientStatCard icon={Users} iconBg="bg-blue-500" label="Toplam Üye" value="142" trend={{ value: '+12%', direction: 'up' }} />
            <GradientStatCard icon={CircleDollarSign} iconBg="bg-emerald-500" label="Tahsilat" value="₺48.250" trend={{ value: '+8%', direction: 'up' }} />
            <GradientStatCard icon={Clock} iconBg="bg-orange-500" label="Bekleyen" value="₺12.800" trend={{ value: '-3%', direction: 'down' }} />
            <GradientStatCard icon={Megaphone} iconBg="bg-purple-500" label="Duyuru" value="8" />
          </div>

          {/* Charts row with gradient headers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader icon={BarChart3} title="Gelir vs Gider" gradient="purple" />
              <div className="bg-white dark:bg-white/[0.03] p-5">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockBarData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Bar dataKey="gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <GradientSectionHeader icon={Megaphone} title="Son Duyurular" gradient="orange" />
              <div className="bg-white dark:bg-white/[0.03] divide-y divide-gray-100 dark:divide-gray-800">
                {mockAnnouncements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      ann.category === 'urgent' ? 'bg-red-100 dark:bg-red-500/15'
                        : ann.category === 'financial' ? 'bg-emerald-100 dark:bg-emerald-500/15'
                        : 'bg-blue-100 dark:bg-blue-500/15',
                    )}>
                      <Megaphone className={cn(
                        'w-3.5 h-3.5',
                        ann.category === 'urgent' ? 'text-red-600' : ann.category === 'financial' ? 'text-emerald-600' : 'text-blue-600',
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ann.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ann.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links — colorful */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Üyeler', icon: Users, bg: 'bg-blue-500' },
              { label: 'Daireler', icon: DoorOpen, bg: 'bg-teal-500' },
              { label: 'Aidat', icon: CircleDollarSign, bg: 'bg-emerald-500' },
              { label: 'Dönemler', icon: CalendarDays, bg: 'bg-indigo-500' },
              { label: 'Finans', icon: BarChart3, bg: 'bg-orange-500' },
              { label: 'Duyurular', icon: Megaphone, bg: 'bg-purple-500' },
            ].map(link => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] hover:shadow-sm transition-all text-xs font-medium text-foreground"
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', link.bg)}>
                  <link.icon className="w-4 h-4 text-white" />
                </div>
                {link.label}
              </button>
            ))}
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </AdminLayout>
  )
}
