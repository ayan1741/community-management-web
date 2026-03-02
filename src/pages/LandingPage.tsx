import { Link } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { FadeIn } from '@/hooks/useInView'
import {
  Building2, CreditCard, Megaphone, Wrench, Users, ClipboardList,
  CheckCircle2, ChevronRight, Shield, Clock, Star, ArrowRight,
  Bell, Lock, Sun, Moon, TrendingUp, Zap, Eye,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════════ */

function Navbar({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/30">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">KomşuNet</span>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {['Özellikler', 'Nasıl Çalışır', 'Fiyatlar'].map((label) => (
            <a key={label} href={`#${label === 'Özellikler' ? 'features' : label === 'Nasıl Çalışır' ? 'how-it-works' : 'pricing'}`}
              className="text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onToggle} aria-label="Tema değiştir"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login" className="text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
            Giriş Yap
          </Link>
          <Link to="/admin-register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-600/30">
            Ücretsiz Başla
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO — gradient glows + grid + dashboard mockup
   ═══════════════════════════════════════════════════════════════════════════ */

function Hero({ isDark }: { isDark: boolean }) {
  const gridStyle = {
    backgroundImage: isDark
      ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  }

  return (
    <section className="relative min-h-screen flex items-center bg-slate-50 dark:bg-zinc-950 overflow-hidden pt-16 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[700px] w-[1100px]"
          style={{ background: isDark ? 'radial-gradient(ellipse at top, rgba(59,130,246,0.22) 0%, transparent 65%)' : 'radial-gradient(ellipse at top, rgba(59,130,246,0.10) 0%, transparent 65%)' }} />
        <div className="absolute left-1/4 bottom-0 h-[500px] w-[700px]"
          style={{ background: isDark ? 'radial-gradient(ellipse at bottom, rgba(99,102,241,0.14) 0%, transparent 65%)' : 'radial-gradient(ellipse at bottom, rgba(99,102,241,0.06) 0%, transparent 65%)' }} />
        <div className="absolute inset-0" style={gridStyle} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <FadeIn>
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
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-[64px] font-bold text-slate-900 dark:text-zinc-50 leading-[1.05] tracking-tight mb-6">
              Sitenizi Yönetmek{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Hiç Bu Kadar
              </span>
              <br />Kolay Olmamıştı
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Aidat takibinden arıza bildirimine, duyurulardan toplantı kararlarına —
              sitenizin tüm yönetimini tek, güvenli ve şeffaf platformda toplayın.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/admin-register"
                className="group flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:-translate-y-px shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50">
                Ücretsiz Başla
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#features"
                className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 px-7 py-3.5 text-sm font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-white/5 hover:-translate-y-px transition-all">
                Özellikleri İncele
              </a>
            </div>
          </FadeIn>

          {/* Trust signals */}
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 dark:text-zinc-600">
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
          </FadeIn>
        </div>

        {/* Dashboard Mockup — enhanced with real content */}
        <FadeIn delay={0.5}>
          <div className="mt-20 relative mx-auto max-w-5xl">
            {/* Floating cards */}
            <div className="absolute -left-4 xl:-left-32 top-12 hidden xl:flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-xl shadow-slate-200/80 dark:shadow-black/60 z-10 animate-float-slow">
              <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500">Tahsilat Oranı</p>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">98.2%</p>
              </div>
            </div>

            <div className="absolute -right-4 xl:-right-32 bottom-24 hidden xl:flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-xl shadow-slate-200/80 dark:shadow-black/60 z-10 animate-float-slow" style={{ animationDelay: '1.5s' }}>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500">Yeni Ödeme</p>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">₺2.400 alındı</p>
              </div>
            </div>

            {/* Main mockup */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xl shadow-slate-300/40 dark:shadow-black/60 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
                <span className="h-3 w-3 rounded-full bg-red-400/70 dark:bg-red-500/50" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70 dark:bg-amber-500/50" />
                <span className="h-3 w-3 rounded-full bg-green-400/70 dark:bg-green-500/50" />
                <div className="flex-1 mx-4">
                  <div className="rounded-md bg-slate-200 dark:bg-zinc-800 px-3 py-1 text-center">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500">app.komsunet.com/dashboard</span>
                  </div>
                </div>
              </div>

              <div className="flex" style={{ minHeight: '360px' }}>
                {/* Sidebar */}
                <div className="hidden sm:flex w-52 flex-col border-r border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 p-4 gap-1">
                  <div className="flex items-center gap-2.5 mb-4 px-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                      <Building2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Güneş Sitesi</p>
                      <p className="text-[9px] text-slate-400 dark:text-zinc-600">Yönetici Paneli</p>
                    </div>
                  </div>
                  {['Dashboard', 'Üyeler', 'Daireler', 'Aidatlar', 'Duyurular', 'Arızalar'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 rounded-lg px-2 py-2 ${i === 0 ? 'bg-blue-600/10 dark:bg-blue-600/15' : ''}`}>
                      <div className={`h-4 w-4 rounded ${i === 0 ? 'bg-blue-500/30' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                      <span className={`text-[11px] ${i === 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-zinc-600'}`}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Hoş geldin, Mehmet</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-600">Güneş Sitesi — Mart 2026</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Toplam Daire', value: '48', color: 'text-blue-500 dark:text-blue-400' },
                      { label: 'Aktif Üye', value: '42', color: 'text-green-500 dark:text-green-400' },
                      { label: 'Bekleyen Aidat', value: '₺12.4K', color: 'text-amber-500 dark:text-amber-400' },
                      { label: 'Açık Arıza', value: '3', color: 'text-red-500 dark:text-red-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 mb-1">{label}</div>
                        <div className={`text-lg font-bold ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                    <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-3">Son Aktiviteler</p>
                    {[
                      { text: 'Kübra Ayan aidatını ödedi', tag: '₺850', tagColor: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
                      { text: 'B-12 asansör arızası bildirdi', tag: 'Açık', tagColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
                      { text: 'Mart dönemi tahakkuku oluşturuldu', tag: '48 daire', tagColor: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
                    ].map(({ text, tag, tagColor }, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400">{text}</span>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-3/4 bg-blue-600/10 dark:bg-blue-600/15 blur-3xl rounded-full" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS — animated counters with visual decoration
   ═══════════════════════════════════════════════════════════════════════════ */

function Stats() {
  const stats = [
    { value: '500+', label: 'Aktif Site', icon: Building2 },
    { value: '50.000+', label: 'Kayıtlı Daire', icon: Users },
    { value: '99.9%', label: 'Uptime Garantisi', icon: Zap },
    { value: '7/24', label: 'Teknik Destek', icon: Clock },
  ]

  return (
    <section className="border-y border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <div key={label} className={`text-center ${i < 3 ? 'md:border-r border-slate-100 dark:border-zinc-800/80' : ''}`}>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 mb-3">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES — bento grid layout (2 large + 4 small)
   ═══════════════════════════════════════════════════════════════════════════ */

const features = [
  { icon: CreditCard, color: 'blue', title: 'Aidat Takibi', description: 'Otomatik aidat planları oluşturun, tahsilat durumunu anlık takip edin, gecikme bildirimlerini otomatik gönderin. Dijital makbuz ve ödeme geçmişi.', large: true },
  { icon: Megaphone, color: 'violet', title: 'Duyuru Sistemi', description: 'Sakinlere anlık bildirimler gönderin. Önemli duyuruları pinleyin, okunma oranlarını takip edin. Push, SMS ve e-posta entegrasyonu.', large: true },
  { icon: Wrench, color: 'amber', title: 'Arıza Bildirimi', description: 'Sakinler bildirir, yönetim atama yapar, süreç şeffaf takip edilir.', large: false },
  { icon: Users, color: 'green', title: 'Üye Yönetimi', description: 'Davet kodu ile güvenli kayıt, rol tabanlı yetkilendirme sistemi.', large: false },
  { icon: Building2, color: 'sky', title: 'Blok & Daire', description: 'Sitenizin blok ve daire yapısını eksiksiz tanımlayın ve yönetin.', large: false },
  { icon: ClipboardList, color: 'rose', title: 'Toplantı & Karar', description: 'Gündem, tutanak ve karar arşivi. Dijital toplantı yönetimi.', large: false },
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
  const large = features.filter(f => f.large)
  const small = features.filter(f => !f.large)

  return (
    <section id="features" className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Özellikler</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight">
              Bir Sitenin İhtiyaç Duyduğu <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Her Şey</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
              Yöneticiden sakinlere kadar herkesin günlük ihtiyaçlarına yanıt veren kapsamlı özellik seti.
            </p>
          </div>
        </FadeIn>

        {/* Bento: 2 large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {large.map(({ icon: Icon, color, title, description }, i) => (
            <FadeIn key={title} delay={i * 0.1}>
              <div className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-8 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 h-full">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-indigo-500/[0.03]" />
                <div className={`relative inline-flex items-center justify-center rounded-xl border p-3 mb-5 ${iconColorMap[color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="relative text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">{title}</h3>
                <p className="relative text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bento: 4 small cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {small.map(({ icon: Icon, color, title, description }, i) => (
            <FadeIn key={title} delay={0.2 + i * 0.08}>
              <div className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/40 h-full">
                <div className={`relative inline-flex items-center justify-center rounded-xl border p-2.5 mb-4 ${iconColorMap[color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="relative text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const steps = [
    { step: '01', title: 'Sitenizi Kaydedin', description: 'Birkaç dakikada organizasyonunuzu oluşturun. Site adı, adres ve blok yapısını tanımlayın.', items: ['Ücretsiz hesap oluştur', 'Blok ve daire yapısını ekle', 'Yönetici bilgilerini gir'] },
    { step: '02', title: 'Üyelerinizi Davet Edin', description: 'Davet kodu gönderin veya başvuruları onaylayın. Rol atayın, daire bağlantısı yapın.', items: ['Davet kodu oluştur', 'Başvuruları incele ve onayla', 'Rol ve daire ata'] },
    { step: '03', title: 'Birlikte Yönetin', description: 'Aidatları takip edin, duyuru yapın, arızaları yönetin. Tüm süreçler şeffaf ve kayıt altında.', items: ['Anlık bildirimler', 'Şeffaf süreç takibi', 'Dijital arşiv'] },
  ]

  return (
    <section id="how-it-works" className="py-28 bg-white dark:bg-zinc-900/20 border-y border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Nasıl Çalışır</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight">
              3 Adımda Yönetimi <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Dijitalleştirin</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
              Teknik bilgi gerekmez. Kurulumdan aktif kullanıma geçiş ortalama 15 dakika.
            </p>
          </div>
        </FadeIn>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute h-px" style={{ top: '24px', left: '22%', right: '22%', background: 'linear-gradient(to right, transparent, rgba(147,197,253,0.6), rgba(147,197,253,0.6), transparent)' }} />
          {steps.map(({ step, title, description, items }, i) => (
            <FadeIn key={step} delay={i * 0.15}>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 shrink-0">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-3">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-500 leading-relaxed mb-5">{description}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-zinc-400">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHY US
   ═══════════════════════════════════════════════════════════════════════════ */

function WhyUs() {
  const items = [
    { icon: Shield, title: 'Kurumsal Güvenlik', description: 'Tüm veriler SSL ile şifrelenir, KVKK uyumlu altyapıda saklanır. Düzenli güvenlik denetimleri.' },
    { icon: Eye, title: 'Şeffaf Raporlama', description: 'Aidat gelirleri, giderler ve bakiyeler anlık olarak tüm yetkili kullanıcılara raporlanır.' },
    { icon: Bell, title: 'Anlık Bildirimler', description: 'Önemli gelişmelerden sakinler anında haberdar olur. Push, SMS ve e-posta entegrasyonu.' },
  ]

  return (
    <section className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Neden KomşuNet?</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-5 tracking-tight leading-tight">
                Güven, Şeffaflık ve<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Verimlilik Bir Arada</span>
              </h2>
              <p className="text-base text-slate-600 dark:text-zinc-400 leading-relaxed mb-8">
                Türkiye'deki site yönetiminin en büyük sorunu şeffaflık eksikliğidir.
                KomşuNet, her işlemi kayıt altına alarak yöneticiye güven, sakinlere huzur sağlar.
              </p>
              <Link to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-600/25 hover:-translate-y-px">
                Hemen Başla
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {items.map(({ icon: Icon, title, description }, i) => (
              <FadeIn key={title} delay={i * 0.12}>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">{title}</h4>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS — featured + grid
   ═══════════════════════════════════════════════════════════════════════════ */

function Testimonials() {
  const testimonials = [
    { name: 'Mehmet Kaya', role: 'Site Yöneticisi', location: 'Ankara, Çankaya', units: '72 Daireli Site', rating: 5, text: 'KomşuNet sayesinde aidat takibinde yaşadığımız karmaşadan kurtulduk. Artık her sakin borcunu anlık görebiliyor, bizim de telefon trafiğimiz %80 azaldı.' },
    { name: 'Ayşe Demir', role: 'Site Sakini', location: 'İstanbul, Kadıköy', units: '120 Daireli Kompleks', rating: 5, text: 'Artık yöneticiye ulaşmak için saatlerce uğraşmıyorum. Arıza bildirdim, 2 saatte yanıt geldi. Aidat dekontlarıma uygulamadan erişebiliyorum.' },
    { name: 'Hasan Yılmaz', role: 'YK Başkanı', location: 'İzmir, Bornova', units: '48 Daireli Site', rating: 5, text: 'Finansal şeffaflık konusunda sakinlerden gelen baskı artmıştı. KomşuNet ile tüm gelir-gider kayıtları herkesin görebileceği şekilde arşivleniyor.' },
  ]

  return (
    <section className="py-28 bg-white dark:bg-zinc-900/20 border-y border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Kullanıcı Deneyimleri</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight">
              Yöneticiler ve Sakinler <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Anlatıyor</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, location, units, rating, text }, i) => (
            <FadeIn key={name} delay={i * 0.12}>
              <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 flex flex-col transition-all duration-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 h-full">
                <div className="absolute top-4 right-5 text-5xl leading-none font-serif text-slate-100 dark:text-zinc-800 select-none pointer-events-none">"</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="relative text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6 flex-1">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">{role} · {location}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-600">{units}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════════ */

function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Fiyatlandırma</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4 tracking-tight">
              Sitenizin Büyüklüğüne Göre Seçin
            </h2>
            <p className="text-base text-slate-600 dark:text-zinc-400 max-w-lg mx-auto">
              Kredi kartı gerekmez. 30 gün ücretsiz deneyin, memnun kalmazsanız ücret ödemezsiniz.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-7 transition-all duration-300 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-1">Başlangıç</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-zinc-50">Ücretsiz</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-600 mb-6">50 daireye kadar</p>
              <ul className="space-y-2.5 mb-7">
                {['Blok & Daire Yönetimi', 'Üye Yönetimi', 'Temel Duyurular', 'E-posta Desteği'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block w-full rounded-xl border border-slate-300 dark:border-zinc-700 py-2.5 text-center text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5">
                Ücretsiz Başla
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 p-7 shadow-2xl shadow-blue-600/30 md:scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-md">En Popüler</span>
              </div>
              <p className="text-sm font-semibold text-blue-200 mb-1">Profesyonel</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-white">₺299</span>
                <span className="text-sm text-blue-200 mb-1">/ay</span>
              </div>
              <p className="text-xs text-blue-200/70 mb-6">200 daireye kadar</p>
              <ul className="space-y-2.5 mb-7">
                {['Başlangıç özellikleri', 'Aidat Takibi', 'Arıza Bildirimi', 'SMS Bildirimleri', 'Gelir-Gider Raporu', 'Öncelikli Destek'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-blue-200 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-blue-700 transition-all hover:bg-white/90 shadow-sm">
                30 Gün Ücretsiz Dene
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-7 transition-all duration-300 hover:shadow-lg">
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-1">Kurumsal</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-zinc-50">Özel</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-600 mb-6">Sınırsız daire</p>
              <ul className="space-y-2.5 mb-7">
                {['Profesyonel özellikleri', 'Toplantı & Karar Yönetimi', 'Özel entegrasyonlar', 'SLA garantisi', '7/24 Öncelikli Destek'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@komsunet.com"
                className="block w-full rounded-xl border border-slate-300 dark:border-zinc-700 py-2.5 text-center text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5">
                Teklif Alın
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════════ */

function FinalCTA() {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.10) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <FadeIn>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            <span className="text-xs font-medium text-white/90">30 gün ücretsiz, kredi kartı gerektirmez</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Sitenizi Bugün<br /><span className="text-white/80">Dijitalleştirin</span>
          </h2>
          <p className="text-base text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Yüzlerce sitenin tercih ettiği platforma katılın. Kurulum 15 dakika, fark anında hissedilir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 transition-all hover:bg-white/90 hover:-translate-y-px shadow-lg shadow-black/20">
              Ücretsiz Başla
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login"
              className="rounded-xl border border-white/25 px-8 py-3.5 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:border-white/40 hover:-translate-y-px">
              Zaten hesabım var
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER — multi-column
   ═══════════════════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                <Building2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">KomşuNet</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed max-w-[200px]">
              Türkiye'nin akıllı site yönetim platformu. Güvenli, şeffaf, kolay.
            </p>
          </div>

          {/* Ürün */}
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Ürün</p>
            <ul className="space-y-2">
              {['Özellikler', 'Fiyatlandırma', 'Güncellemeler', 'SSS'].map(l => (
                <li key={l}><a href="#" className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Şirket</p>
            <ul className="space-y-2">
              {['Hakkımızda', 'Blog', 'İletişim', 'Kariyer'].map(l => (
                <li key={l}><a href="#" className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Hukuki */}
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Hukuki</p>
            <ul className="space-y-2">
              {['Gizlilik Politikası', 'Kullanım Şartları', 'KVKK Aydınlatma', 'Çerez Politikası'].map(l => (
                <li key={l}><a href="#" className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-zinc-600">© 2026 KomşuNet. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-600">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>in Türkiye</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

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
