import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from '@/components/ui/card'
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
  Search, Plus, Filter, MoreHorizontal, ChevronLeft,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertTriangle, XCircle,
  FileText, Bell, Mail, Settings, DoorOpen,
  Inbox, Eye, Edit2, Trash2, Download,
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
  active: { label: 'Aktif', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  pending: { label: 'Bekliyor', class: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  inactive: { label: 'Pasif', class: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400' },
}

const categoryConfig: Record<string, { label: string; class: string }> = {
  maintenance: { label: 'Bakım', class: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  financial: { label: 'Mali', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  general: { label: 'Genel', class: 'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200 dark:border-gray-500/20' },
  urgent: { label: 'Acil', class: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' },
}

// ── Reusable Components (TailAdmin Style) ──────────────

/** Page Header — icon + title + description + actions */
function DemoPageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: React.ElementType
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/** Stat Card — neutral icon, bold value, optional trend */
function DemoStatCard({
  label,
  value,
  icon: Icon,
  trend,
  footnote,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: { value: string; direction: 'up' | 'down' }
  footnote?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
        {trend && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full',
            trend.direction === 'up'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
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

// ── Main Demo Page ──────────────────────────────────────

export function DesignDemoPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1: Page Header Örnekleri
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Page Header Örnekleri
            </h2>
          </div>

          {/* Variant 1: Standard */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <DemoPageHeader
              icon={Users}
              title="Üye Yönetimi"
              description="Site sakinlerini görüntüle, düzenle ve yönet"
              actions={
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Yeni Üye
                </Button>
              }
            />
          </div>

          {/* Variant 2: Finance */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <DemoPageHeader
              icon={CircleDollarSign}
              title="Gelir-Gider Yönetimi"
              description="Mali kayıtları takip edin, bütçe planlayın"
              actions={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Dışa Aktar
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Kayıt Ekle
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2: Stat / KPI Kartları
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stat / KPI Kartları
            </h2>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DemoStatCard
              icon={Users}
              label="Toplam Üye"
              value="142"
              trend={{ value: '+12%', direction: 'up' }}
              footnote="Son 30 gün"
            />
            <DemoStatCard
              icon={CircleDollarSign}
              label="Toplam Tahsilat"
              value="₺48.250"
              trend={{ value: '+8.5%', direction: 'up' }}
              footnote="Bu dönem"
            />
            <DemoStatCard
              icon={Clock}
              label="Bekleyen Borç"
              value="₺12.800"
              trend={{ value: '-3.2%', direction: 'down' }}
              footnote="Geçen aya göre"
            />
            <DemoStatCard
              icon={Megaphone}
              label="Aktif Duyuru"
              value="8"
              footnote="3 tanesi bu hafta"
            />
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DemoStatCard
              icon={Building2}
              label="Toplam Daire"
              value="96"
              footnote="3 blok"
            />
            <DemoStatCard
              icon={CalendarDays}
              label="Aktif Dönem"
              value="2"
              trend={{ value: 'Normal', direction: 'up' }}
            />
            <DemoStatCard
              icon={TrendingUp}
              label="Net Bakiye"
              value="₺35.450"
              trend={{ value: '+15%', direction: 'up' }}
              footnote="Gelir - Gider"
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3: Veri Tablosu
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Veri Tablosu
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            {/* Table header with search & filters */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Üye Listesi</h3>
                <p className="text-xs text-muted-foreground mt-0.5">142 kayıt</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Ara..." className="pl-8 h-8 w-48 text-sm" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1.5" />
                  Filtre
                </Button>
              </div>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                  <TableHead className="font-semibold">Üye</TableHead>
                  <TableHead className="font-semibold">Daire</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Durum</TableHead>
                  <TableHead className="font-semibold">Telefon</TableHead>
                  <TableHead className="font-semibold text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMembers.map(member => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {member.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <span className="font-medium text-sm">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.unit}</TableCell>
                    <TableCell>
                      <span className="text-sm">{roleLabels[member.role] ?? member.role}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        statusConfig[member.status]?.class,
                      )}>
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
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4: Grafikler
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Grafikler
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gelir vs Gider</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Son 6 ay</p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-5">
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

            {/* Donut Chart */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gider Dağılımı</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Kategori bazlı</p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-5">
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

            {/* Area Chart — full width */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Tahsilat Oranı Trendi</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Son 6 aylık tahsilat yüzdesi</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs">6 Ay</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">1 Yıl</Button>
                </div>
              </div>
              <div className="p-5">
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
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
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
            {/* Announcements list */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-foreground">Son Duyurular</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Tümünü Gör
                </Button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockAnnouncements.map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
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

            {/* Activity/Notification feed */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-foreground">Son Aktiviteler</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Tümünü Gör
                </Button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { icon: CircleDollarSign, text: 'Ahmet Yılmaz ₺450 ödeme yaptı', time: '5 dk önce', color: 'text-emerald-500' },
                  { icon: Users, text: 'Fatma Kaya üye olarak eklendi', time: '1 saat önce', color: 'text-blue-500' },
                  { icon: AlertTriangle, text: 'B Blok asansör arıza bildirimi', time: '3 saat önce', color: 'text-amber-500' },
                  { icon: Mail, text: 'Aidat hatırlatma e-postaları gönderildi', time: '6 saat önce', color: 'text-gray-500' },
                  { icon: CheckCircle2, text: 'Haziran dönemi tahakkukları oluşturuldu', time: '1 gün önce', color: 'text-emerald-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className={cn('w-4 h-4', item.color)} />
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
              Badge & Status Örnekleri
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
            <div className="space-y-6">
              {/* shadcn Badge variants */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">shadcn Badge</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Status badges */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Durum Rozetleri</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Aktif
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    <Clock className="w-3 h-3" /> Bekliyor
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    <XCircle className="w-3 h-3" /> Reddedildi
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    <AlertTriangle className="w-3 h-3" /> Bilgi
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400">
                    Taslak
                  </span>
                </div>
              </div>

              {/* Trend indicators */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Trend Göstergeleri</p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" /> +12.5%
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
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
            SECTION 7: Hızlı Erişim / Link Grid
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Hızlı Erişim Grid
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Üyeler', icon: Users },
              { label: 'Daireler', icon: DoorOpen },
              { label: 'Aidat', icon: CircleDollarSign },
              { label: 'Dönemler', icon: CalendarDays },
              { label: 'Gelir-Gider', icon: BarChart3 },
              { label: 'Duyurular', icon: Megaphone },
            ].map(link => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-xs font-medium text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 8: Empty State
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Boş Durum (Empty State)
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-foreground">Henüz kayıt bulunamadı</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Başlamak için yeni bir kayıt ekleyin. Eklediğiniz kayıtlar burada listelenecektir.
              </p>
              <Button className="mt-5" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni Kayıt Ekle
              </Button>
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

          {/* Stat card skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="mt-4 space-y-2">
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden animate-pulse">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
            </div>
            <div className="p-5 space-y-3">
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

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-foreground">Yeni Kayıt Formu</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Gerekli alanları doldurun</p>
            </div>
            <div className="p-5">
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

          {/* Page header */}
          <DemoPageHeader
            icon={BarChart3}
            title="Genel Bakış"
            description="Site yönetimi özet paneli"
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <CalendarDays className="w-3 h-3 mr-1" /> Mart 2026
                </Badge>
              </div>
            }
          />

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DemoStatCard icon={Users} label="Toplam Üye" value="142" trend={{ value: '+12%', direction: 'up' }} />
            <DemoStatCard icon={CircleDollarSign} label="Tahsilat" value="₺48.250" trend={{ value: '+8%', direction: 'up' }} />
            <DemoStatCard icon={Clock} label="Bekleyen" value="₺12.800" trend={{ value: '-3%', direction: 'down' }} />
            <DemoStatCard icon={Megaphone} label="Duyuru" value="8" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-foreground">Gelir vs Gider</h3>
              </div>
              <div className="p-5">
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

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-foreground">Son Duyurular</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockAnnouncements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-gray-500" />
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

          {/* Quick links */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Üyeler', icon: Users },
              { label: 'Daireler', icon: DoorOpen },
              { label: 'Aidat', icon: CircleDollarSign },
              { label: 'Dönemler', icon: CalendarDays },
              { label: 'Finans', icon: BarChart3 },
              { label: 'Duyurular', icon: Megaphone },
            ].map(link => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors text-xs font-medium text-foreground"
              >
                <link.icon className="w-4 h-4 text-gray-500" />
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
