'use client'
import { useState, useEffect } from 'react'
import { WheelItem, AppConfig, DEFAULT_APP_CONFIG } from '@/lib/config'

type Tab = 'content' | 'items'

const EMPTY_ITEM: WheelItem = { label: '', image: '', color: '#FF6B9D', emoji: '🎁' }

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('content')
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG)
  const [items, setItems] = useState<WheelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/items').then(r => r.json()),
    ]).then(([config, itemList]) => {
      setAppConfig({ ...DEFAULT_APP_CONFIG, ...config })
      setItems(Array.isArray(itemList) ? itemList : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function saveConfig() {
    setSaving(true)
    try {
      const r = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appConfig),
      })
      showToast(r.ok ? '✅ Đã lưu nội dung!' : '❌ Lỗi lưu nội dung')
    } catch { showToast('❌ Lỗi kết nối') }
    setSaving(false)
  }

  async function saveItems() {
    if (items.length === 0) { showToast('❌ Cần ít nhất 1 phần thưởng'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      showToast(r.ok ? '✅ Đã lưu phần thưởng!' : '❌ Lỗi lưu phần thưởng')
    } catch { showToast('❌ Lỗi kết nối') }
    setSaving(false)
  }

  function updateItem(index: number, field: keyof WheelItem, value: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }])
  }

  function deleteItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p className="loading-text">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1 className="title" style={{ marginBottom: '28px' }}>⚙️ Admin</h1>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'content' ? ' active' : ''}`}
          onClick={() => setTab('content')}
        >
          📝 Nội dung
        </button>
        <button
          className={`admin-tab${tab === 'items' ? ' active' : ''}`}
          onClick={() => setTab('items')}
        >
          🎁 Phần thưởng
        </button>
      </div>

      {/* Content tab */}
      {tab === 'content' && (
        <div className="admin-section">
          <p className="admin-section-desc">Chỉnh nội dung hiển thị trong app. Thay đổi có hiệu lực ngay.</p>

          {([
            ['title', '🎡 Tiêu đề trang'],
            ['welcomeEmoji', '🎉 Emoji chào mừng'],
            ['welcomeTitle', 'Tiêu đề chào mừng'],
            ['welcomeMessage', 'Nội dung chào mừng'],
            ['startButtonText', 'Nút bắt đầu'],
            ['resultTitle', 'Tiêu đề kết quả'],
            ['spinButtonText', 'Nút quay'],
            ['spinAgainText', 'Nút quay lại'],
          ] as [keyof AppConfig, string][]).map(([key, label]) => (
            <div key={key} className="admin-field">
              <label className="admin-label">{label}</label>
              <input
                className="admin-input"
                value={appConfig[key]}
                onChange={e => setAppConfig(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={DEFAULT_APP_CONFIG[key]}
              />
            </div>
          ))}

          <button className="btn-primary" onClick={saveConfig} disabled={saving} style={{ marginTop: '8px' }}>
            {saving ? 'Đang lưu...' : '💾 Lưu nội dung'}
          </button>
        </div>
      )}

      {/* Items tab */}
      {tab === 'items' && (
        <div className="admin-section">
          <p className="admin-section-desc">Chỉnh phần thưởng trên vòng quay. Nhấn lưu để áp dụng.</p>

          <div className="admin-items-list">
            {items.map((item, i) => (
              <div key={i} className="admin-item-row">
                <input
                  className="admin-input admin-input-emoji"
                  value={item.emoji}
                  onChange={e => updateItem(i, 'emoji', e.target.value)}
                  placeholder="🎁"
                  title="Emoji"
                />
                <input
                  type="color"
                  className="admin-color-input"
                  value={item.color}
                  onChange={e => updateItem(i, 'color', e.target.value)}
                  title="Màu segment"
                />
                <input
                  className="admin-input admin-input-label"
                  value={item.label}
                  onChange={e => updateItem(i, 'label', e.target.value)}
                  placeholder="Tên phần thưởng"
                  title="Tên"
                />
                <input
                  className="admin-input admin-input-image"
                  value={item.image}
                  onChange={e => updateItem(i, 'image', e.target.value)}
                  placeholder="https://... URL ảnh"
                  title="URL ảnh"
                />
                <button
                  className="admin-delete-btn"
                  onClick={() => deleteItem(i)}
                  title="Xóa"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          <div className="admin-actions">
            <button className="btn-secondary" onClick={addItem} style={{ fontSize: '0.95rem', padding: '10px 24px' }}>
              ➕ Thêm phần thưởng
            </button>
            <button className="btn-primary" onClick={saveItems} disabled={saving} style={{ fontSize: '0.95rem', padding: '10px 24px' }}>
              {saving ? 'Đang lưu...' : '💾 Lưu phần thưởng'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
