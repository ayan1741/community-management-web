import { Link } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import {
  Building2,
  CreditCard,
  Megaphone,
  Wrench,
  Users,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  Shield,
  Clock,
  Star,
  ArrowRight,
  BarChart3,
  Bell,
  Lock,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react'

// ─── Navbar ──────────────────────────────────────────────────────────────────

interface NavbarProps {
  isDark: boolean
  onToggle: () => void
}

function Navbar({ isDark, onToggle }: NavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/30">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight transition-colors duration-300">
            KomşuNet
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: 'Özellikler', href: '#features' },
            { label: 'Nasıl Çalışır', href: '#how-it-works' },
            { label: 'Fiyatlar', href: '#pricing' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            to="/login"
            className="text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            to="/admin-register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-600/30"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  isDark: boolean
}

function Hero({ isDark }: HeroProps) {
  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }

  return (
    <section className="relative min-h-screen flex items-center bg-slate-50 dark:bg-zinc-950 overflow-hidden pt-16 transition-colors duration-300">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial gradient – top center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 h-[700px] w-[1100px]"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at top, rgba(59,130,246,0.22) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at top, rgba(59,130,246,0.10) 0%, transparent 65%)',
          }}
        />
        {/* Secondary glow */}
        <div
          className="absolute left-1/4 bottom-0 h-[500px] w-[700px]"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at bottom, rgba(99,102,241,0.14) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at bottom, rgba(99,102,241,0.06) 0%, transparent 65%)',
          }}
        />
        {/* Grid */}
        <div className="absolute inset-0" style={gridStyle} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge with gradient border */}
          <div className="inline-block mb-8">
            <div className="p-px rounded-full bg-gradient-to-r from-blue-500/40 via-indigo-500/30 to-blue-500/40">
              <div className="rounded-full bg-slate-50 dark:bg-zinc-950 px-4 py-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Türkiye'nin Akıllı Site Yönetim Platformu
                </span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[64px] font-bold text-slate-900 dark:text-zinc-50 leading-[1.05] tracking-tight mb-6 transition-colors duration-300">
            Sitenizi Yönetmek{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Hiç Bu Kadar
            </span>
            <br />
            Kolay Olmamıştı
          </h1>

          {/* Sub */}
          <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto transition-colors duration-300">
            Aidat takibinden arıza bildirimine, duyurulardan toplantı kararlarına —
            sitenizin tüm yönetimini tek, güvenli ve şeffaf platformda toplayın.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/admin-register"
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:-translate-y-px shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              Ücretsiz Başla
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 px-7 py-3.5 text-sm font-medium text-slate-700 dark:text-zinc-300 transition-all hover:border-slate-400 dark:hover:border-zinc-600 hover:text-slate-900 dark:hover:text-zinc-100 bg-white dark:bg-white/5 hover:-translate-y-px"
            >
              Özellikleri İncele
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 dark:text-zinc-600 transition-colors duration-300">
            {[
              { icon: Lock, label: 'SSL Şifrelemeli' },
              { icon: Shield, label: 'KVKK Uyumlu' },
              { icon: Clock, label: '7/24 Erişim' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-700" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          {/* Floating metric cards */}
          <div className="absolute -left-4 xl:-left-32 top-12 hidden xl:flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-xl shadow-slate-200/80 dark:shadow-black/60 z-10">
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">Tahsilat Oranı</p>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">98.2%</p>
            </div>
          </div>

          <div className="absolute -right-4 xl:-right-32 bottom-24 hidden xl:flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-xl shadow-slate-200/80 dark:shadow-black/60 z-10">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">Yeni Ödeme</p>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">₺2.400 alındı</p>
            </div>
          </div>

          {/* Mockup */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xl shadow-slate-300/40 dark:shadow-black/60 overflow-hidden transition-colors duration-300">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 transition-colors duration-300">
              <span className="h-3 w-3 rounded-full bg-red-400/70 dark:bg-red-500/50" />
              <span className="h-3 w-3 rounded-full bg-amber-400/70 dark:bg-amber-500/50" />
              <span className="h-3 w-3 rounded-full bg-green-400/70 dark:bg-green-500/50" />
              <div className="flex-1 mx-4">
                <div className="rounded-md bg-slate-200 dark:bg-zinc-800 px-3 py-1 text-center transition-colors duration-300">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500">app.komsunet.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="flex" style={{ minHeight: '340px' }}>
              {/* Sidebar mock */}
              <div className="hidden sm:flex w-52 flex-col border-r border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 p-4 gap-1 transition-colors duration-300">
                <div className="flex items-center gap-2.5 mb-4 px-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                    <Building2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="h-2 w-20 rounded bg-slate-300 dark:bg-zinc-700" />
                    <div className="h-1.5 w-14 rounded bg-slate-200 dark:bg-zinc-800 mt-1" />
                  </div>
                </div>
                {['Dashboard', 'Üyeler', 'Daireler', 'Aidatlar', 'Duyurular', 'Arızalar'].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                        i === 0 ? 'bg-blue-600/10 dark:bg-blue-600/15' : ''
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded ${
                          i === 0 ? 'bg-blue-500/30' : 'bg-slate-200 dark:bg-zinc-800'
                        }`}
                      />
                      <span
                        className={`text-[11px] ${
                          i === 0
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-slate-400 dark:text-zinc-600'
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Main content mock */}
              <div className="flex-1 p-6">
                <div className="mb-5">
                  <div className="h-3 w-36 rounded bg-slate-300 dark:bg-zinc-700 mb-2" />
                  <div className="h-2 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Toplam Daire', value: '48', color: 'blue' },
                    { label: 'Aktif Üye', value: '42', color: 'green' },
                    { label: 'Bekleyen Aidat', value: '₺12.400', color: 'amber' },
                    { label: 'Açık Arıza', value: '3', color: 'red' },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 transition-colors duration-300"
                    >
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 mb-1">{label}</div>
                      <div
                        className={`text-lg font-bold ${
                          color === 'blue'
                            ? 'text-blue-500 dark:text-blue-400'
                            : color === 'green'
                            ? 'text-green-500 dark:text-green-400'
                            : color === 'amber'
                            ? 'text-amber-500 dark:text-amber-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent activity mock */}
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors duration-300">
                  <div className="h-2 w-28 rounded bg-slate-300 dark:bg-zinc-700 mb-3" />
                  {[85, 60, 75, 45].map((w, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                      <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
                      <div className="flex-1">
                        <div className="h-2 rounded bg-slate-200 dark:bg-zinc-700 mb-1" style={{ width: `${w}%` }} />
                        <div className="h-1.5 w-16 rounded bg-slate-100 dark:bg-zinc-800" />
                      </div>
                      <div className="h-5 w-12 rounded-full bg-slate-200 dark:bg-zinc-800" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glow under mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-3/4 bg-blue-600/10 dark:bg-blue-600/15 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: '500+', label: 'Aktif Site' },
    { value: '50.000+', label: 'Kayıtlı Daire' },
    { value: '99.9%', label: 'Uptime Garantisi' },
    { value: '7/24', label: 'Teknik Destek' },
  ]

  return (
    <section className="border-y border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`text-center ${i < 3 ? 'md:border-r border-slate-100 dark:border-zinc-800/80' : ''}`}
            >
              <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-sm text-slate-500 dark:text-zinc-500 transition-colors duration-300">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: CreditCard,
    color: 'blue',
    title: 'Aidat Takibi',
    description:
      'Otomatik aidat planları oluşturun, tahsilat durumunu anlık takip edin, gecikme bildirimlerini otomatik gönderin.',
  },
  {
    icon: Megaphone,
    color: 'violet',
    title: 'Duyuru Sistemi',
    description:
      'Sakinlere anlık bildirimler gönderin. Önemli duyuruları pinleyin, okunma oranlarını takip edin.',
  },
  {
    icon: Wrench,
    color: 'amber',
    title: 'Arıza Bildirimi',
    description:
      'Sakinler arıza bildirir, yönetim atama yapar, süreç şeffaf biçimde takip edilir. Hiçbir sorun kaybolmaz.',
  },
  {
    icon: Users,
    color: 'green',
    title: 'Üye Yönetimi',
    description:
      'Davet kodu ile güvenli kayıt, rol tabanlı yetkilendirme. Sakin, yönetici, yönetim kurulu ayrımı.',
  },
  {
    icon: Building2,
    color: 'sky',
    title: 'Blok & Daire Yönetimi',
    description:
      'Sitenizin blok ve daire yapısını eksiksiz tanımlayın. Daire bazlı geçmiş ve üyelik kaydı.',
  },
  {
    icon: ClipboardList,
    color: 'rose',
    title: 'Toplantı & Karar',
    description:
      'Gündem maddeleri oluşturun, toplantı tutanaklarını dijital saklayın, alınan kararları arşivleyin.',
  },
]

const iconColorMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
  sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
}

function Features() {
  return (
    <section id="features" className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Özellikler
          </p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight transition-colors duration-300">
            Bir Sitenin İhtiyaç Duyduğu Her Şey
          </h2>
          <p className="text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto transition-colors duration-300">
            Yöneticiden sakinlere kadar herkesin günlük ihtiyaçlarına yanıt veren
            kapsamlı özellik seti.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40"
            >
              {/* Gradient shimmer on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-indigo-500/[0.03]" />
              <div
                className={`relative inline-flex items-center justify-center rounded-xl border p-2.5 mb-4 ${iconColorMap[color]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="relative text-base font-semibold text-slate-900 dark:text-zinc-100 mb-2 transition-colors duration-300">{title}</h3>
              <p className="relative text-sm text-slate-500 dark:text-zinc-500 leading-relaxed transition-colors duration-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Sitenizi Kaydedin',
      description:
        'Birkaç dakikada organizasyonunuzu oluşturun. Site adı, adres ve blok yapısını tanımlayın.',
      items: ['Ücretsiz hesap oluştur', 'Blok ve daire yapısını ekle', 'Yönetici bilgilerini gir'],
    },
    {
      step: '02',
      title: 'Üyelerinizi Davet Edin',
      description:
        'Davet kodu gönderin veya başvuruları onaylayın. Rol atayın, daire bağlantısı yapın.',
      items: ['Davet kodu oluştur', 'Başvuruları incele ve onayla', 'Rol ve daire ata'],
    },
    {
      step: '03',
      title: 'Birlikte Yönetin',
      description:
        'Aidatları takip edin, duyuru yapın, arızaları yönetin. Tüm süreçler şeffaf ve kayıt altında.',
      items: ['Anlık bildirimler', 'Şeffaf süreç takibi', 'Dijital arşiv'],
    },
  ]

  return (
    <section id="how-it-works" className="py-28 bg-white dark:bg-zinc-900/20 border-y border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Nasıl Çalışır
          </p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight transition-colors duration-300">
            3 Adımda Yönetimi Dijitalleştirin
          </h2>
          <p className="text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto transition-colors duration-300">
            Teknik bilgi gerekmez. Kurulumdan aktif kullanıma geçiş ortalama 15 dakika.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector line between steps – desktop */}
          <div
            className="hidden md:block absolute h-px"
            style={{
              top: '24px',
              left: '22%',
              right: '22%',
              background: 'linear-gradient(to right, transparent, rgba(147,197,253,0.6), rgba(147,197,253,0.6), transparent)',
            }}
          />

          {steps.map(({ step, title, description, items }) => (
            <div key={step} className="relative">
              {/* Step number */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 shrink-0">
                  {step}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-3 transition-colors duration-300">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-500 leading-relaxed mb-5 transition-colors duration-300">{description}</p>

              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-zinc-400 transition-colors duration-300">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why Us ───────────────────────────────────────────────────────────────────

function WhyUs() {
  const items = [
    {
      icon: Shield,
      title: 'Kurumsal Güvenlik',
      description:
        'Tüm veriler SSL ile şifrelenir, KVKK uyumlu altyapıda saklanır. Düzenli güvenlik denetimleri yapılır.',
    },
    {
      icon: BarChart3,
      title: 'Şeffaf Raporlama',
      description:
        'Aidat gelirleri, giderler ve bakiyeler anlık olarak tüm yetkili kullanıcılara raporlanır.',
    },
    {
      icon: Bell,
      title: 'Anlık Bildirimler',
      description:
        'Önemli gelişmelerden sakinler anında haberdar olur. Push bildirim, SMS ve e-posta entegrasyonu.',
    },
  ]

  return (
    <section className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
              Neden KomşuNet?
            </p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-5 tracking-tight leading-tight transition-colors duration-300">
              Güven, Şeffaflık ve
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Verimlilik Bir Arada
              </span>
            </h2>
            <p className="text-base text-slate-600 dark:text-zinc-400 leading-relaxed mb-8 transition-colors duration-300">
              Türkiye'deki site yönetiminin en büyük sorunu şeffaflık eksikliğidir.
              KomşuNet, her işlemi kayıt altına alarak yöneticiye güven,
              sakinlere huzur sağlar.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-600/25 hover:-translate-y-px"
            >
              Hemen Başla
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Right cards */}
          <div className="space-y-4">
            {items.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1 transition-colors duration-300">{title}</h4>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed transition-colors duration-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    {
      name: 'Mehmet Kaya',
      role: 'Site Yöneticisi',
      location: 'Ankara, Çankaya',
      units: '72 Daireli Site',
      rating: 5,
      text: 'KomşuNet sayesinde aidat takibinde yaşadığımız karmaşadan kurtulduk. Artık her sakin borcunu anlık görebiliyor, bizim de telefon trafiğimiz %80 azaldı.',
    },
    {
      name: 'Ayşe Demir',
      role: 'Site Sakini',
      location: 'İstanbul, Kadıköy',
      units: '120 Daireli Kompleks',
      rating: 5,
      text: 'Artık yöneticiye ulaşmak için saatlerce uğraşmıyorum. Arıza bildirdim, 2 saatte yanıt geldi. Aidat dekontlarıma uygulamadan erişebiliyorum.',
    },
    {
      name: 'Hasan Yılmaz',
      role: 'Yönetim Kurulu Başkanı',
      location: 'İzmir, Bornova',
      units: '48 Daireli Site',
      rating: 5,
      text: 'Finansal şeffaflık konusunda sakinlerden gelen baskı artmıştı. KomşuNet ile tüm gelir-gider kayıtları herkesin görebileceği şekilde arşivleniyor.',
    },
  ]

  return (
    <section className="py-28 bg-white dark:bg-zinc-900/20 border-y border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Kullanıcı Deneyimleri
          </p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight transition-colors duration-300">
            Yöneticiler ve Sakinler Anlatıyor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, location, units, rating, text }) => (
            <div
              key={name}
              className="relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 hover:border-slate-300 dark:hover:border-zinc-700"
            >
              {/* Decorative large quote mark */}
              <div className="absolute top-4 right-5 text-5xl leading-none font-serif text-slate-100 dark:text-zinc-800 select-none pointer-events-none">
                "
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="relative text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6 flex-1 transition-colors duration-300">
                "{text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800 transition-colors duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm shrink-0">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 transition-colors duration-300">{name}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 transition-colors duration-300">
                    {role} · {location}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-600 transition-colors duration-300">{units}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Fiyatlandırma
          </p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight transition-colors duration-300">
            Sitenizin Büyüklüğüne Göre Seçin
          </h2>
          <p className="text-base text-slate-600 dark:text-zinc-400 max-w-lg mx-auto transition-colors duration-300">
            Kredi kartı gerekmez. 30 gün ücretsiz deneyin, memnun kalmazsanız ücret ödemezsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
          {/* Starter */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-7 transition-colors duration-300">
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-1">Başlangıç</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-zinc-50">Ücretsiz</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-600 mb-6">50 daireye kadar</p>
            <ul className="space-y-2.5 mb-7">
              {['Blok & Daire Yönetimi', 'Üye Yönetimi', 'Temel Duyurular', 'E-posta Desteği'].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 transition-colors duration-300">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                    {f}
                  </li>
                )
              )}
            </ul>
            <Link
              to="/register"
              className="block w-full rounded-xl border border-slate-300 dark:border-zinc-700 py-2.5 text-center text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Pro – Popular */}
          <div className="relative rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 p-7 shadow-2xl shadow-blue-600/30">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-md">
                En Popüler
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-200 mb-1">Profesyonel</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">₺299</span>
              <span className="text-sm text-blue-200 mb-1">/ay</span>
            </div>
            <p className="text-xs text-blue-200/70 mb-6">200 daireye kadar</p>
            <ul className="space-y-2.5 mb-7">
              {[
                'Başlangıç özellikleri',
                'Aidat Takibi',
                'Arıza Bildirimi',
                'SMS Bildirimleri',
                'Gelir-Gider Raporu',
                'Öncelikli Destek',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-blue-200 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-blue-700 transition-all hover:bg-white/90 shadow-sm"
            >
              30 Gün Ücretsiz Dene
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-7 transition-colors duration-300">
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-1">Kurumsal</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-zinc-50">Özel</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-600 mb-6">Sınırsız daire</p>
            <ul className="space-y-2.5 mb-7">
              {[
                'Profesyonel özellikleri',
                'Toplantı & Karar Yönetimi',
                'Özel entegrasyonlar',
                'SLA garantisi',
                '7/24 Öncelikli Destek',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 transition-colors duration-300">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:info@komsunet.com"
              className="block w-full rounded-xl border border-slate-300 dark:border-zinc-700 py-2.5 text-center text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              Teklif Alın
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      {/* Top radial highlight */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.10) 0%, transparent 60%)',
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
          <span className="text-xs font-medium text-white/90">
            30 gün ücretsiz, kredi kartı gerektirmez
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
          Sitenizi Bugün
          <br />
          <span className="text-white/80">Dijitalleştirin</span>
        </h2>

        <p className="text-base text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
          Yüzlerce sitenin tercih ettiği platforma katılın.
          Kurulum 15 dakika, fark anında hissedilir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 transition-all hover:bg-white/90 hover:-translate-y-px shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/25"
          >
            Ücretsiz Başla
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/25 px-8 py-3.5 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:border-white/40 hover:-translate-y-px"
          >
            Zaten hesabım var
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors duration-300">KomşuNet</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-zinc-600 transition-colors duration-300">
            {['Gizlilik Politikası', 'Kullanım Şartları', 'KVKK Aydınlatma', 'İletişim'].map(
              (link) => (
                <a key={link} href="#" className="transition-colors hover:text-slate-700 dark:hover:text-zinc-400">
                  {link}
                </a>
              )
            )}
          </div>

          <p className="text-xs text-slate-300 dark:text-zinc-700 transition-colors duration-300">
            © 2025 KomşuNet. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navbar isDark={isDark} onToggle={toggleTheme} />
      <Hero isDark={isDark} />
      <Stats />
      <Features />
      <HowItWorks />
      <WhyUs />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
