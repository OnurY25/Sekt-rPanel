'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { generateMockCustomers } from '@/lib/mockData';
import { Customer } from '@/types';
import { Search, Plus, Phone, Mail, MapPin, Tag, X, Edit2, Trash2, TrendingUp } from 'lucide-react';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

export default function CustomersPage() {
  const { tenant, addNotification } = useStore();
  const [customers, setCustomers] = useState<Customer[]>(generateMockCustomers());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name: '', phone: '', email: '', address: '', notes: '' }); setEditingCustomer(null); setShowModal(true); };
  const openEdit = (c: Customer) => { setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '', notes: c.notes || '' }); setEditingCustomer(c); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editingCustomer) {
      setCustomers((prev) => prev.map((c) => c.id === editingCustomer.id ? { ...c, ...form } : c));
      addNotification({ title: 'Müşteri Güncellendi', message: `${form.name} bilgileri güncellendi.`, type: 'success' });
    } else {
      const newC: Customer = { id: `c${Date.now()}`, tenant_id: 't1', ...form, total_orders: 0, total_spent: 0, created_at: new Date().toISOString(), tags: [] };
      setCustomers((prev) => [newC, ...prev]);
      addNotification({ title: 'Yeni Müşteri Eklendi', message: `${form.name} sisteme eklendi.`, type: 'success' });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} adlı müşteriyi silmek istediğinize emin misiniz?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addNotification({ title: 'Müşteri Silindi', message: `${name} sistemden silindi.`, type: 'warning' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Müşteriler</h1>
            <p className="page-subtitle">{customers.length} kayıtlı müşteri</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Yeni Müşteri
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Toplam Müşteri', value: customers.length, color: '#6366f1' },
          { label: 'VIP Müşteri', value: customers.filter((c) => c.tags?.includes('VIP')).length, color: '#f59e0b' },
          { label: 'Bu Ay Yeni', value: 2, color: '#10b981' },
          { label: 'Toplam Ciro', value: formatCurrency(customers.reduce((s, c) => s + (c.total_spent || 0), 0)), color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="İsim, telefon veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '32px' }} />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>İletişim</th>
                <th>Adres</th>
                <th>Sipariş</th>
                <th>Toplam Harcama</th>
                <th>Etiket</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar" style={{ width: '36px', height: '36px' }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString('tr-TR')} tarihinden beri
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Phone size={12} /> {c.phone}
                      </div>
                      {c.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Mail size={12} /> {c.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {c.address ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={12} /> {c.address}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}
                  </td>
                  <td><span style={{ fontWeight: '600' }}>{c.total_orders || 0}</span></td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(c.total_spent || 0)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.tags?.map((tag) => (
                        <span key={tag} style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                          background: tag === 'VIP' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                          color: tag === 'VIP' ? '#f59e0b' : '#818cf8',
                          border: `1px solid ${tag === 'VIP' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(c)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={32} style={{ marginBottom: '8px' }} />
              <p>Arama kriterlerine uygun müşteri bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Ad Soyad *', placeholder: 'Örn: Ahmet Yılmaz', type: 'text' },
                { key: 'phone', label: 'Telefon *', placeholder: '0532 111 2233', type: 'tel' },
                { key: 'email', label: 'E-posta', placeholder: 'ornek@mail.com', type: 'email' },
                { key: 'address', label: 'Adres', placeholder: 'Mahalle, İlçe, Şehir', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="input-label">{f.label}</label>
                  <input className="input" type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="input-label">Notlar</label>
                <textarea className="input" placeholder="Özel notlar..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingCustomer ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
