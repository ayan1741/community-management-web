import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'
import {
  Plus, Paperclip, Pencil, Trash2, X, Upload,
} from 'lucide-react'
import type { FinanceRecordListItem, FinanceRecordListResult, FinanceCategoryTreeItem } from '@/types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Nakit' },
  { value: 'bank_transfer', label: 'Havale/EFT' },
  { value: 'credit_card', label: 'Kredi Kartı' },
  { value: 'other', label: 'Diğer' },
]

type FilterType = 'all' | 'income' | 'expense'

export function FinanceRecordsPage() {
  const { activeMembership } = useAuth()
  const orgId = activeMembership?.organizationId
  const isAdmin = activeMembership?.role === 'admin'
  const location = useLocation()
  const now = new Date()

  // List state
  const [records, setRecords] = useState<FinanceRecordListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterCategoryId, setFilterCategoryId] = useState<string>('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterPeriodYear, setFilterPeriodYear] = useState('')
  const [filterPeriodMonth, setFilterPeriodMonth] = useState('')

  // Categories for filter & form
  const [categories, setCategories] = useState<FinanceCategoryTreeItem[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [editing, setEditing] = useState<FinanceRecordListItem | null>(null)
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formDesc, setFormDesc] = useState('')
  const [formPaymentMethod, setFormPaymentMethod] = useState('')
  const [formPeriodYear, setFormPeriodYear] = useState('')
  const [formPeriodMonth, setFormPeriodMonth] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleting, setDeleting] = useState<FinanceRecordListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Document upload
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  // Check for initial type from navigation state
  useEffect(() => {
    const state = location.state as { type?: string } | null
    if (state?.type === 'income' || state?.type === 'expense') {
      openAdd(state.type)
    }
  }, [])

  useEffect(() => {
    if (orgId) {
      loadCategories()
    }
  }, [orgId])

  useEffect(() => {
    if (orgId) loadRecords()
  }, [orgId, page, filterType, filterCategoryId, filterStartDate, filterEndDate, filterPeriodYear, filterPeriodMonth])

  async function loadCategories() {
    if (!orgId) return
    try {
      const r = await api.get<FinanceCategoryTreeItem[]>(`/organizations/${orgId}/finance/categories?isActive=true`)
      setCategories(r.data)
    } catch { /* silent */ }
  }

  async function loadRecords() {
    if (!orgId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (filterType !== 'all') params.set('type', filterType)
      if (filterCategoryId) params.set('categoryId', filterCategoryId)
      if (filterStartDate) params.set('startDate', filterStartDate)
      if (filterEndDate) params.set('endDate', filterEndDate)
      if (filterPeriodYear) params.set('periodYear', filterPeriodYear)
      if (filterPeriodMonth) params.set('periodMonth', filterPeriodMonth)

      const r = await api.get<FinanceRecordListResult>(`/organizations/${orgId}/finance/records?${params}`)
      setRecords(r.data.items)
      setTotalCount(r.data.totalCount)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  function clearFilters() {
    setFilterType('all')
    setFilterCategoryId('')
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterPeriodYear('')
    setFilterPeriodMonth('')
    setPage(1)
  }

  function openAdd(type: 'income' | 'expense') {
    setEditing(null)
    setFormType(type)
    setFormCategoryId('')
    setFormAmount('')
    const today = new Date()
    setFormDate(today.toISOString().slice(0, 10))
    setFormDesc('')
    setFormPaymentMethod('')
    setFormPeriodYear(String(today.getFullYear()))
    setFormPeriodMonth(String(today.getMonth() + 1))
    setFormError('')
    setShowForm(true)
  }

  function openEdit(rec: FinanceRecordListItem) {
    setEditing(rec)
    setFormType(rec.type)
    setFormCategoryId(rec.categoryId)
    setFormAmount(String(rec.amount))
    setFormDate(rec.recordDate)
    setFormDesc(rec.description)
    setFormPaymentMethod(rec.paymentMethod ?? '')
    setFormPeriodYear(String(rec.periodYear))
    setFormPeriodMonth(String(rec.periodMonth))
    setFormError('')
    setShowForm(true)
  }

  async function saveRecord() {
    if (!formCategoryId) { setFormError('Kategori seçin'); return }
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) { setFormError('Tutar geçersiz'); return }
    if (!formDate) { setFormError('Tarih seçin'); return }
    if (!formDesc.trim() || formDesc.trim().length < 3) { setFormError('Açıklama en az 3 karakter olmalı'); return }
    if (!orgId) return

    setSaving(true)
    setFormError('')
    try {
      const periodYear = formPeriodYear ? parseInt(formPeriodYear) : undefined
      const periodMonth = formPeriodMonth ? parseInt(formPeriodMonth) : undefined

      if (editing) {
        await api.put(`/organizations/${orgId}/finance/records/${editing.id}`, {
          categoryId: formCategoryId,
          amount,
          recordDate: formDate,
          description: formDesc.trim(),
          paymentMethod: formPaymentMethod || null,
          periodYear,
          periodMonth,
        })
      } else {
        await api.post(`/organizations/${orgId}/finance/records`, {
          categoryId: formCategoryId,
          type: formType,
          amount,
          recordDate: formDate,
          description: formDesc.trim(),
          paymentMethod: formPaymentMethod || null,
          periodYear,
          periodMonth,
        })
      }
      setShowForm(false)
      await loadRecords()
    } catch (err: any) {
      setFormError(err.response?.data?.error ?? 'İşlem başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord() {
    if (!deleting || !orgId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/organizations/${orgId}/finance/records/${deleting.id}`)
      setDeleting(null)
      await loadRecords()
    } catch (err: any) {
      setDeleting(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function uploadDocument(recordId: string, file: File) {
    if (!orgId) return
    setUploadingId(recordId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/organizations/${orgId}/finance/records/${recordId}/document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await loadRecords()
    } catch { /* silent */ }
    finally { setUploadingId(null) }
  }

  // Flatten categories for select
  const flatCategories = categories.flatMap(c => {
    const items = [{ id: c.id, name: c.name, type: c.type, hasChildren: c.children.length > 0 }]
    c.children.forEach(ch => items.push({ id: ch.id, name: `  └ ${ch.name}`, type: ch.type, hasChildren: false }))
    return items
  })

  const selectableFormCategories = flatCategories.filter(c => c.type === formType)

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">İşlemler</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gelir ve gider kayıtlarını yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openAdd('income')}>
              <Plus className="w-4 h-4 mr-1" />
              Gelir Ekle
            </Button>
            <Button onClick={() => openAdd('expense')}>
              <Plus className="w-4 h-4 mr-1" />
              Gider Ekle
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Type toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            {([['all', 'Tümü'], ['income', 'Gelir'], ['expense', 'Gider']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setFilterType(key); setPage(1) }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  filterType === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={filterCategoryId}
            onChange={e => { setFilterCategoryId(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
          >
            <option value="">Tüm Kategoriler</option>
            {flatCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterStartDate}
            onChange={e => { setFilterStartDate(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
            placeholder="Başlangıç"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={e => { setFilterEndDate(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
            placeholder="Bitiş"
          />

          <select
            value={filterPeriodYear}
            onChange={e => { setFilterPeriodYear(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
          >
            <option value="">Dönem Yılı</option>
            {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filterPeriodMonth}
            onChange={e => { setFilterPeriodMonth(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
          >
            <option value="">Dönem Ayı</option>
            {MONTHS_TR.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>

          {(filterType !== 'all' || filterCategoryId || filterStartDate || filterEndDate || filterPeriodYear || filterPeriodMonth) && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> Temizle
            </button>
          )}
        </div>

        {/* Table */}
        <Card className="mb-4">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-foreground mb-1">Kayıt bulunamadı</p>
                <p className="text-xs text-muted-foreground">Filtreleri değiştirin veya yeni kayıt ekleyin.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Dönem</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tür</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Açıklama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ödeme</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Tutar</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(rec => (
                      <tr key={rec.id} className={cn(
                        'border-b border-border hover:bg-muted/50 transition-colors',
                        rec.isOpeningBalance && 'bg-muted/30 italic'
                      )}>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(rec.recordDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {MONTHS_TR[rec.periodMonth - 1]} {rec.periodYear}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            rec.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {rec.type === 'income' ? 'Gelir' : 'Gider'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon name={rec.categoryIcon} className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-foreground">{rec.categoryName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{rec.description}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {rec.paymentMethod ? PAYMENT_METHODS.find(m => m.value === rec.paymentMethod)?.label ?? rec.paymentMethod : '—'}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          rec.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {rec.type === 'income' ? '+' : '−'}{formatCurrency(rec.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {rec.documentUrl ? (
                              <a href={rec.documentUrl} target="_blank" rel="noopener noreferrer"
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted" title="Belgeyi Aç">
                                <Paperclip className="w-3.5 h-3.5" />
                              </a>
                            ) : isAdmin && (
                              <button
                                onClick={() => {
                                  fileRef.current?.setAttribute('data-record-id', rec.id)
                                  fileRef.current?.click()
                                }}
                                disabled={uploadingId === rec.id}
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50" title="Belge Yükle"
                              >
                                <Upload className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isAdmin && !rec.isOpeningBalance && (
                              <>
                                <button onClick={() => openEdit(rec)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted" title="Düzenle">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleting(rec)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Sil">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">{totalCount} kayıt</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</Button>
              <span className="px-3 text-xs text-muted-foreground">Sayfa {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for doc upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          const recordId = fileRef.current?.getAttribute('data-record-id')
          if (file && recordId) uploadDocument(recordId, file)
          e.target.value = ''
        }}
      />

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editing ? 'Kaydı Düzenle' : (formType === 'income' ? 'Gelir Ekle' : 'Gider Ekle')}
            </h3>

            <div className="space-y-4">
              {/* Type badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tür:</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  formType === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {formType === 'income' ? 'Gelir' : 'Gider'}
                </span>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Kategori *</label>
                <select
                  value={formCategoryId}
                  onChange={e => setFormCategoryId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Kategori seçin</option>
                  {selectableFormCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Tutar (₺) *"
                type="number"
                step="0.01"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="0.00"
              />

              <Input
                label="Tarih *"
                type="date"
                value={formDate}
                onChange={e => {
                  setFormDate(e.target.value)
                  // Default dönem = tarih'in yıl/ayı
                  if (e.target.value) {
                    const d = new Date(e.target.value)
                    setFormPeriodYear(String(d.getFullYear()))
                    setFormPeriodMonth(String(d.getMonth() + 1))
                  }
                }}
                max={new Date().toISOString().slice(0, 10)}
              />

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Ait Olduğu Dönem</label>
                <div className="flex gap-2">
                  <select
                    value={formPeriodYear}
                    onChange={e => setFormPeriodYear(e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  >
                    {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={formPeriodMonth}
                    onChange={e => setFormPeriodMonth(e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  >
                    {MONTHS_TR.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Bu kaydın ait olduğu mali dönem. Varsayılan: kayıt tarihinin ay/yılı.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Açıklama *</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="İşlem açıklaması (min 3 karakter)"
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Ödeme Yöntemi</label>
                <select
                  value={formPaymentMethod}
                  onChange={e => setFormPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Seçin (opsiyonel)</option>
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>İptal</Button>
              <Button onClick={saveRecord} loading={saving}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleting}
        title="Kaydı Sil"
        message={`"${deleting?.description}" kaydını silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        loading={deleteLoading}
        onConfirm={deleteRecord}
        onCancel={() => setDeleting(null)}
      />
    </AdminLayout>
  )
}
