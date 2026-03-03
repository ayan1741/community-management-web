import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import {
  Plus, Zap, Droplet, Flame, Sparkles, Shield, ArrowUpDown,
  Trees, Waves, ShieldCheck, Users, Wrench, Briefcase, Landmark,
  CircleDot, PiggyBank, Building, Percent, AlertTriangle, Sprout,
} from 'lucide-react'
import type { FinanceCategoryTreeItem } from '@/types'

const ICON_OPTIONS = [
  { name: 'zap', Icon: Zap },
  { name: 'droplet', Icon: Droplet },
  { name: 'flame', Icon: Flame },
  { name: 'sparkles', Icon: Sparkles },
  { name: 'shield', Icon: Shield },
  { name: 'arrow-up-down', Icon: ArrowUpDown },
  { name: 'trees', Icon: Trees },
  { name: 'waves', Icon: Waves },
  { name: 'shield-check', Icon: ShieldCheck },
  { name: 'users', Icon: Users },
  { name: 'wrench', Icon: Wrench },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'landmark', Icon: Landmark },
  { name: 'circle-dot', Icon: CircleDot },
  { name: 'piggy-bank', Icon: PiggyBank },
  { name: 'building', Icon: Building },
  { name: 'percent', Icon: Percent },
  { name: 'alert-triangle', Icon: AlertTriangle },
]

type TabType = 'expense' | 'income'

export function FinanceCategoriesPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId

  const [categories, setCategories] = useState<FinanceCategoryTreeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabType>('expense')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FinanceCategoryTreeItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState<string | null>(null)
  const [formParentId, setFormParentId] = useState<string | null>(null)
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Seed state
  const [seeding, setSeeding] = useState(false)

  // Toggle state
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => { if (orgId) loadCategories() }, [orgId])

  async function loadCategories() {
    if (!orgId) return
    setLoading(true)
    try {
      const r = await api.get<FinanceCategoryTreeItem[]>(`/organizations/${orgId}/finance/categories`)
      setCategories(r.data)
    } catch {
      setError('Kategoriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function seedCategories() {
    if (!orgId) return
    setSeeding(true)
    try {
      await api.post(`/organizations/${orgId}/finance/categories/seed`)
      await loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Varsayılan kategoriler oluşturulamadı')
    } finally {
      setSeeding(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setFormName('')
    setFormIcon(null)
    setFormParentId(null)
    setFormSortOrder('0')
    setFormError('')
    setShowForm(true)
  }

  function openEdit(cat: FinanceCategoryTreeItem) {
    setEditing(cat)
    setFormName(cat.name)
    setFormIcon(cat.icon)
    setFormSortOrder(String(cat.sortOrder))
    setFormError('')
    setShowForm(true)
  }

  async function saveCategory() {
    if (!formName.trim()) { setFormError('Kategori adı zorunlu'); return }
    if (!orgId) return
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await api.put(`/organizations/${orgId}/finance/categories/${editing.id}`, {
          name: formName.trim(),
          icon: formIcon,
          sortOrder: parseInt(formSortOrder) || 0,
        })
      } else {
        await api.post(`/organizations/${orgId}/finance/categories`, {
          name: formName.trim(),
          type: tab,
          parentId: formParentId,
          icon: formIcon,
          sortOrder: parseInt(formSortOrder) || 0,
        })
      }
      setShowForm(false)
      await loadCategories()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(catId: string) {
    if (!orgId) return
    setToggling(catId)
    try {
      await api.patch(`/organizations/${orgId}/finance/categories/${catId}/toggle`)
      await loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Durum değiştirilemedi')
    } finally {
      setToggling(null)
    }
  }

  const filtered = categories.filter(c => c.type === tab)
  const parentOptions = filtered.filter(c => c.isActive)

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Kategoriler</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gelir ve gider kalemlerini düzenleyin</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Kategori Ekle
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 border-b border-border">
          {([['expense', 'Gider Kategorileri'], ['income', 'Gelir Kategorileri']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Seed Banner */}
        {!loading && categories.length === 0 && (
          <div className="mb-6 p-6 text-center bg-card rounded-xl border border-border">
            <Sprout className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Kategoriler henüz oluşturulmamış</p>
            <p className="text-xs text-muted-foreground mb-4">
              Hızlı başlangıç için varsayılan kategorileri oluşturabilir veya sıfırdan ekleyebilirsiniz.
            </p>
            <Button onClick={seedCategories} loading={seeding}>Varsayılanları Oluştur</Button>
          </div>
        )}

        {/* Category List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            </CardContent>
          </Card>
        ) : filtered.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filtered.map(cat => (
                  <div key={cat.id}>
                    {/* Parent row */}
                    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <CategoryIcon name={cat.icon} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                        {cat.isSystem && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">Sistem</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Aktif</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Pasif</span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} disabled={cat.isSystem}>
                          Düzenle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cat.isActive ? 'text-warning hover:text-warning hover:bg-warning/10' : 'text-success hover:text-success hover:bg-success/10'}
                          onClick={() => toggleActive(cat.id)}
                          disabled={cat.isSystem || toggling === cat.id}
                        >
                          {cat.isActive ? 'Pasife Al' : 'Aktife Al'}
                        </Button>
                      </div>
                    </div>
                    {/* Children */}
                    {cat.children.map(child => (
                      <div key={child.id} className="flex items-center justify-between px-5 py-3 pl-12 hover:bg-muted/50 transition-colors border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <CategoryIcon name={child.icon} className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-foreground">{child.name}</span>
                          {child.isSystem && (
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">Sistem</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {child.isActive ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Aktif</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Pasif</span>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(child)} disabled={child.isSystem}>
                            Düzenle
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={child.isActive ? 'text-warning hover:text-warning hover:bg-warning/10' : 'text-success hover:text-success hover:bg-success/10'}
                            onClick={() => toggleActive(child.id)}
                            disabled={child.isSystem || toggling === child.id}
                          >
                            {child.isActive ? 'Pasife Al' : 'Aktife Al'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="mt-4 p-4 bg-muted rounded-xl border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Not:</span>{' '}
            Sistem kategorileri düzenlenemez ve silinemez. İşlem kaydı olan kategoriler sadece pasife alınabilir.
          </p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            </h3>

            <div className="space-y-4">
              {/* Type indicator (add only) */}
              {!editing && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tür:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    tab === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {tab === 'income' ? 'Gelir' : 'Gider'}
                  </span>
                </div>
              )}

              <Input
                label="Kategori Adı *"
                placeholder="örn. Elektrik"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                autoFocus
              />

              {/* Parent select (add only) */}
              {!editing && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Üst Kategori (opsiyonel)</label>
                  <select
                    value={formParentId ?? ''}
                    onChange={e => setFormParentId(e.target.value || null)}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">Ana Kategori (Kök)</option>
                    {parentOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Icon Picker */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">İkon</label>
                <div className="grid grid-cols-9 gap-1.5">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormIcon(formIcon === opt.name ? null : opt.name)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        formIcon === opt.name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      )}
                    >
                      <opt.Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Sıra"
                type="number"
                value={formSortOrder}
                onChange={e => setFormSortOrder(e.target.value)}
                placeholder="0"
              />

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={saveCategory} loading={saving}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
