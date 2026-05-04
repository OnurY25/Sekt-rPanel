'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Payment, PaymentType, Customer, Order } from '@/types';
import { CreditCard, Plus, X, TrendingUp, Banknote, Smartphone, Building2, Loader2 } from 'lucide-react';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  cash: 'Nakit',
  card: 'Kredi/Banka Kartı',
  transfer: 'EFT/Havale',
  deposit: 'Kapora',
};

const PAYMENT_ICONS: Record<PaymentType, any> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Building2,
  deposit: Smartphone,
};

const PAYMENT_COLORS: Record<PaymentType, string> = {
  cash: '#10b981',
  card: '#6366f1',
  transfer: '#3b82f6',
  deposit: '#f59e0b',
};

export default function PaymentsPage() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', order_id: '', amount: '', type: 'cash' as PaymentType, notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [paymentsRes, customersRes, ordersRes] = await Promise.all([
      supabase.from('payments').select('*, customer:customers(id, name), order:orders(id, title)').order('paid_at', { ascending: false }),
      supabase.from('customers').select('id, name').order('name'),
      supabase.from('orders').select('id, customer_id, title, remaining_balance').neq('status', 'cancelled')
    ]);

    if (paymentsRes.data) setPayments(paymentsRes.data as any);
    if (customersRes.data) setCustomers(customersRes.data as any);
    if (ordersRes.data) setOrders(ordersRes.data as any);
    setLoading(false);
  };

  if (!tenant) return null;

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const byType = (type: PaymentType) => payments.filter((p) => p.type === type).reduce((s, p) => s + p.amount, 0);

  const handleSave = async () => {
    if (!form.customer_id || !form.amount || !tenant?.id) return;
    setSaving(true);
    
    const paymentData = {
      tenant_id: tenant.id,
      customer_id: form.customer_id,
      order_id: form.order_id || null,
      amount: Number(form.amount),
      type: form.type,
      notes: form.notes,
      paid_at: new Date().toISOString()
    };
    
    const { data: newPayment, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select('*, customer:customers(id, name), order:orders(id, title)')
      .single();

    if (!error && newPayment) {
      // If payment is linked to an order, update the order's balance
      if (form.order_id) {
        const order = orders.find(o => o.id === form.order_id);
        if (order) {
          const newBalance = Math.max(0, (order.remaining_balance || 0) - Number(form.amount));
          await supabase.from('orders').update({ remaining_balance: newBalance }).eq('id', order.id);
          // Update local orders state too
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, remaining_balance: newBalance } : o));
        }
      }

      setPayments(prev => [newPayment as any, ...prev]);
      addNotification({ title: 'Ödeme Kaydedildi', message: `${formatCurrency(Number(form.amount))} ödeme alındı.`, type: 'success' });
      setShowModal(false);
      setForm({ customer_id: '', order_id: '', amount: '', type: 'cash', notes: '' });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Finansal veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Ödeme Yönetimi</h1>
            <p className="page-subtitle">{payments.length} ödeme kaydı</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Ödeme Ekle
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ gridColumn: '1 / 2' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Toplam Gelir</div>
          <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: '#10b981' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        {(['cash', 'card', 'transfer'] as PaymentType[]).map((type) => {
          const Icon = PAYMENT_ICONS[type];
          return (
            <div key={type} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${PAYMENT_COLORS[type]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PAYMENT_COLORS[type] }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{PAYMENT_TYPE_LABELS[type]}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: PAYMENT_COLORS[type] }}>
                {formatCurrency(byType(type))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Ödeme Yöntemi</th>
                <th>Tarih</th>
                <th>Not</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const Icon = PAYMENT_ICONS[p.type];
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', borderRadius: '8px' }}>
                          {p.customer?.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{p.customer?.name}</div>
                          {p.order && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.order.title}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: '800', fontSize: '15px', color: '#10b981', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(p.amount)}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${PAYMENT_COLORS[p.type]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PAYMENT_COLORS[p.type] }}>
                          <Icon size={13} />
                        </div>
                        <span style={{ fontSize: '13px', color: PAYMENT_COLORS[p.type], fontWeight: '500' }}>{PAYMENT_TYPE_LABELS[p.type]}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(p.paid_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="empty-state">
              <p>Henüz ödeme kaydı bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Ödeme Kaydet</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Müşteri Adı *</label>
                <select className="input" value={form.customer_id} onChange={(e) => setForm((p) => ({ ...p, customer_id: e.target.value, order_id: '' }))}>
                  <option value="">Müşteri Seçin...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {form.customer_id && (
                <div>
                  <label className="input-label">İlgili Sipariş (Opsiyonel)</label>
                  <select className="input" value={form.order_id} onChange={(e) => setForm((p) => ({ ...p, order_id: e.target.value }))}>
                    <option value="">Bağımsız Ödeme</option>
                    {orders.filter(o => o.customer_id === form.customer_id && (o.remaining_balance || 0) > 0).map(o => (
                      <option key={o.id} value={o.id}>{o.title} (Kalan: {formatCurrency(o.remaining_balance!)})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="input-label">Tutar (₺) *</label>
                <input className="input" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Ödeme Yöntemi</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(Object.keys(PAYMENT_TYPE_LABELS) as PaymentType[]).map((type) => {
                    const Icon = PAYMENT_ICONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setForm((p) => ({ ...p, type }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                          background: form.type === type ? `${PAYMENT_COLORS[type]}20` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${form.type === type ? PAYMENT_COLORS[type] : 'var(--border)'}`,
                          color: form.type === type ? PAYMENT_COLORS[type] : 'var(--text-secondary)',
                          fontSize: '13px', fontWeight: '500', transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={15} /> {PAYMENT_TYPE_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="input-label">Not</label>
                <input className="input" placeholder="Kapora, bakiye vb." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
