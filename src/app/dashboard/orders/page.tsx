'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { getSectorConfig, getStatusLabel, STATUS_COLORS } from '@/lib/sectors';
import { Order, OrderStatus, Customer } from '@/types';
import { Search, Plus, X, Filter, Calendar, CreditCard, ChevronDown, Loader2 } from 'lucide-react';

import AutoserviceOrders from '@/components/AutoserviceOrders';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const ALL_STATUSES: OrderStatus[] = ['pending', 'in_progress', 'waiting_approval', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<any>({ customer_id: '', title: '', status: 'pending', price: '', deposit: '', due_date: '', notes: '' });
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from('orders').select('*, customer:customers(id, name)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').order('name')
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as any);
    if (customersRes.data) setCustomers(customersRes.data as any);
    setLoading(false);
  };

  if (!tenant) return null;
  
  if (tenant.sector === 'autoservice') {
    return <AutoserviceOrders />;
  }

  const config = getSectorConfig(tenant.sector);
  const orderLabel = tenant.sector === 'dental' ? 'Tedavi' : 'Sipariş';

  const filtered = orders.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setForm({ customer_id: '', title: '', status: 'pending', price: '', deposit: '', due_date: '', notes: '' });
    setDynamicFields({});
    setEditingOrder(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.customer_id || !tenant?.id) return;
    setSaving(true);

    const orderData = {
      tenant_id: tenant.id,
      customer_id: form.customer_id,
      title: form.title,
      status: form.status,
      price: Number(form.price) || 0,
      deposit: Number(form.deposit) || 0,
      remaining_balance: (Number(form.price) || 0) - (Number(form.deposit) || 0),
      due_date: form.due_date,
      notes: form.notes,
      custom_data: dynamicFields
    };

    if (editingOrder) {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', editingOrder.id)
        .select('*, customer:customers(id, name)')
        .single();

      if (!error && data) {
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? (data as any) : o));
        addNotification({ title: `${orderLabel} Güncellendi`, message: `"${form.title}" güncellendi.`, type: 'success' });
      }
    } else {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select('*, customer:customers(id, name)')
        .single();

      if (!error && data) {
        setOrders(prev => [data as any, ...prev]);
        addNotification({ title: `Yeni ${orderLabel}`, message: `"${form.title}" oluşturuldu.`, type: 'success' });
      }
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      addNotification({ title: 'Durum Güncellendi', message: `${orderLabel} durumu değiştirildi.`, type: 'info' });
    }
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Veriler hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">{orderLabel}ler</h1>
            <p className="page-subtitle">{filtered.length} kayıt gösteriliyor</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Yeni {orderLabel}
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'Tümü' }, ...ALL_STATUSES.map((s) => ({ key: s, label: getStatusLabel(tenant.sector, s) }))].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`btn btn-sm ${statusFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.label}
            <span style={{ marginLeft: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>
              {f.key === 'all' ? orders.length : orders.filter((o) => o.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Sipariş veya müşteri ara..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '32px' }} />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{orderLabel}</th>
                <th>Müşteri</th>
                <th>Durum</th>
                <th>Tutar</th>
                <th>Kapora</th>
                <th>Teslim Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{order.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px', borderRadius: '7px' }}>
                        {order.customer?.name?.charAt(0)}
                      </div>
                      <span style={{ fontSize: '13px' }}>{order.customer?.name}</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`badge ${STATUS_COLORS[order.status]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{getStatusLabel(tenant.sector, s)}</option>
                      ))}
                    </select>
                  </td>
                  <td><span style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(order.price)}</span></td>
                  <td>
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(order.deposit)}</span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kalan: {formatCurrency(order.price - order.deposit)}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      {new Date(order.due_date).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => { 
                      setForm({ ...order, price: String(order.price), deposit: String(order.deposit) }); 
                      setDynamicFields(order.custom_data || {});
                      setEditingOrder(order); 
                      setShowModal(true); 
                    }}>
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <p>Kayıt bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{editingOrder ? `${orderLabel} Düzenle` : `Yeni ${orderLabel}`}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Müşteri *</label>
                <select className="input" value={form.customer_id} onChange={(e) => setForm((p: any) => ({ ...p, customer_id: e.target.value }))}>
                  <option value="">Müşteri seçin...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">{orderLabel} Başlığı *</label>
                <input className="input" placeholder={`Örn: Takım Elbise - Lacivert`} value={form.title} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Tutar (₺)</label>
                <input className="input" type="number" placeholder="0" value={form.price} onChange={(e) => setForm((p: any) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Kapora (₺)</label>
                <input className="input" type="number" placeholder="0" value={form.deposit} onChange={(e) => setForm((p: any) => ({ ...p, deposit: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Durum</label>
                <select className="input" value={form.status} onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(tenant.sector, s)}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Teslim Tarihi</label>
                <input className="input" type="date" value={form.due_date} onChange={(e) => setForm((p: any) => ({ ...p, due_date: e.target.value }))} />
              </div>

              {/* Sektöre özel alanlar */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  {config.label} — Sektöre Özel Alanlar
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {config.orderFields.map((f) => (
                    <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
                      <label className="input-label">{f.label}</label>
                      {f.type === 'select' ? (
                        <select className="input" value={dynamicFields[f.key] || ''} onChange={(e) => setDynamicFields((p) => ({ ...p, [f.key]: e.target.value }))}>
                          <option value="">Seçin...</option>
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea className="input" placeholder={f.label} value={dynamicFields[f.key] || ''} onChange={(e) => setDynamicFields((p) => ({ ...p, [f.key]: e.target.value }))} />
                      ) : (
                        <input className="input" type={f.type} placeholder={f.label} value={dynamicFields[f.key] || ''} onChange={(e) => setDynamicFields((p) => ({ ...p, [f.key]: e.target.value }))} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Genel Notlar</label>
                <textarea className="input" placeholder="Ek notlar..." value={form.notes} onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : (editingOrder ? 'Güncelle' : 'Oluştur')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
