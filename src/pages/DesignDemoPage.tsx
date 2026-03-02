import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Building2,
  Receipt,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  Settings,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Home,
} from 'lucide-react'

const useTheme = () => {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  const toggle = () => {
    document.documentElement.classList.toggle('dark')
    setDark(!dark)
  }
  return { dark, toggle }
}

export function DesignDemoPage() {
  const { dark, toggle } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const gridStyle = {
    backgroundImage: dark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0" style={gridStyle} />
        {/* Top glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 h-[500px] w-[900px]"
          style={{
            background: dark
              ? 'radial-gradient(ellipse at top, rgba(59,130,246,0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at top, rgba(59,130,246,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              K
            </div>
            <span className="text-lg font-semibold">KomşuNet</span>
            <span className="text-xs text-muted-foreground">Design System Demo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Section: Stat Cards */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Dashboard Stat Kartları
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="size-5" />}
              iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
              label="Toplam Sakin"
              value="248"
              trend="+12"
              trendUp
            />
            <StatCard
              icon={<Receipt className="size-5" />}
              iconBg="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
              label="Tahsil Edilen"
              value="₺184.500"
              trend="+8.2%"
              trendUp
            />
            <StatCard
              icon={<AlertTriangle className="size-5" />}
              iconBg="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              label="Açık Arıza"
              value="7"
              trend="-3"
              trendUp={false}
            />
            <StatCard
              icon={<Building2 className="size-5" />}
              iconBg="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
              label="Toplam Daire"
              value="120"
              trend=""
              trendUp
            />
          </div>
        </section>

        <Separator />

        {/* Section: Button Variants */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Button Varyantları
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus className="size-4" /> Varsayılan (Primary)
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button loading onClick={handleLoadingDemo} disabled={loading}>
              {loading ? 'Yükleniyor...' : 'Loading Demo'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="size-4" /></Button>
          </div>
        </section>

        <Separator />

        {/* Section: Cards */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Kart Örnekleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basit Kart</CardTitle>
                <CardDescription>Kart açıklaması buraya gelir</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  shadcn/ui Card component'i. bg-card token'ı ile light/dark otomatik.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Aksiyon Kartı</CardTitle>
                <CardDescription>Buton içeren kart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">İçerik alanı.</p>
                <div className="flex gap-2">
                  <Button size="sm">Onayla</Button>
                  <Button size="sm" variant="outline">İptal</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Vurgulu Kart</CardTitle>
                <CardDescription>Primary renk tonlu border + bg</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Önemli bilgileri vurgulamak için.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Section: Badge */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Badge Örnekleri
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            {/* Custom status badges */}
            <Badge className="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="size-3 mr-1" /> Aktif
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
              <Clock className="size-3 mr-1" /> Bekliyor
            </Badge>
            <Badge className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20">
              <XCircle className="size-3 mr-1" /> Reddedildi
            </Badge>
          </div>
        </section>

        <Separator />

        {/* Section: Tabs + Table */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Tablo + Tabs
          </h2>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Üye Listesi</CardTitle>
                  <CardDescription>Tüm site sakinleri</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input className="pl-9 h-8 w-56" placeholder="Ara..." />
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="size-4" /> Dışa Aktar
                  </Button>
                  <Button size="sm">
                    <Plus className="size-4" /> Ekle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <div className="px-6">
                  <TabsList>
                    <TabsTrigger value="all">Tümü (248)</TabsTrigger>
                    <TabsTrigger value="active">Aktif (230)</TabsTrigger>
                    <TabsTrigger value="pending">Bekleyen (12)</TabsTrigger>
                    <TabsTrigger value="suspended">Askıda (6)</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sakin</TableHead>
                        <TableHead>Blok / Daire</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: 'Mehmet Ayan', unit: 'A Blok / 5', role: 'Yönetici', status: 'active' },
                        { name: 'Kübra Ayan', unit: 'A Blok / 5', role: 'Sakin', status: 'active' },
                        { name: 'Ali Demir', unit: 'B Blok / 12', role: 'Sakin', status: 'pending' },
                        { name: 'Fatma Yılmaz', unit: 'A Blok / 3', role: 'Denetçi', status: 'active' },
                        { name: 'Hasan Kaya', unit: 'C Blok / 7', role: 'Sakin', status: 'suspended' },
                      ].map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                          <TableCell>
                            <Badge variant={m.role === 'Yönetici' ? 'default' : 'secondary'}>
                              {m.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                m.status === 'active'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                  : m.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                                  : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20'
                              }
                            >
                              {m.status === 'active' ? 'Aktif' : m.status === 'pending' ? 'Bekliyor' : 'Askıda'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Detay <ChevronRight className="size-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Section: Form */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Form Elemanları
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Duyuru Oluştur</CardTitle>
              <CardDescription>Tüm sakinlere duyuru gönder</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Başlık" placeholder="Duyuru başlığı" />
                <Input label="Kategori" placeholder="Genel, Bakım, Aidat..." />
                <div className="md:col-span-2">
                  <Input label="Açıklama" placeholder="Duyuru detayları..." />
                </div>
                <div className="md:col-span-2">
                  <Input label="Hatalı Alan" placeholder="Hata gösterimi" error="Bu alan zorunludur" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="outline">İptal</Button>
                  <Button>Gönder</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section: Quick Actions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Hızlı Erişim Kartları
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Receipt, label: 'Aidat Tahakkuku', desc: 'Yeni dönem oluştur', color: 'text-blue-600 dark:text-blue-400' },
              { icon: AlertTriangle, label: 'Arıza Bildirimi', desc: '7 açık bildirim', color: 'text-amber-600 dark:text-amber-400' },
              { icon: Bell, label: 'Duyuru Yayınla', desc: 'Tüm sakinlere gönder', color: 'text-violet-600 dark:text-violet-400' },
              { icon: Home, label: 'Blok Yönetimi', desc: '3 blok, 120 daire', color: 'text-green-600 dark:text-green-400' },
            ].map((item, i) => (
              <Card key={i} className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="pt-6">
                  <item.icon className={`size-8 mb-3 ${item.color}`} />
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Aç <ChevronRight className="size-3 ml-0.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="h-12" />
      </main>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  trend: string
  trendUp: boolean
}) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
