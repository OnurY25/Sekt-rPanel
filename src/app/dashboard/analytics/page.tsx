'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, CreditCard, ShoppingBag, Download, Loader2 } from 'lucide-react';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function AnalyticsPage() {
  const { tenant } = useStore();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [ordRes, custRes, payRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('customers').select('*'),
      supabase.from('payments').select('*')
    ]);

    if (ordRes.data) setOrders(ordRes.data);
    if (custRes.data) setCustomers(custRes.data);
    if (payRes.data) setPayments(payRes.data);
    setLoading(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')],
      [],
      ['Kategori', 'Toplam Deger'],
      ['Toplam Musteri', customers.length.toString()],
      ['Toplam Siparis', orders.length.toString()],
      ['Toplam Ciro', totalRevenue.toString() + ' TL'],
      [],
      ['Musteri Adi', 'Telefon', 'Sektor/Kaynak'],
      ...customers.map(c => [c.name, c.phone, c.source || 'Web'])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SektorPanel_Rapor_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const avgOrderValue = orders.length ? orders.reduce((s, o) => s + o.price, 0) / orders.length : 0;

  // Derive charts data
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  
  // Aggregate revenue by month
  const monthlyDataMap = payments.reduce((acc, p) => {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    acc[key] = (acc[key] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthly = Object.entries(monthlyDataMap).map(([key, val]) => {
    const [y, m] = key.split('-');
    return { month: monthNames[parseInt(m)], gelir: val };
  }).slice(-6); // last 6 months

  // Fallback if no data
  if (monthly.length === 0) {
    monthly.push({ month: monthNames[new Date().getMonth()], gelir: 0 });
  }

  const sectorBreakdown = [
    { name: 'Nakit', value: payments.filter((p) => p.type === 'cash').reduce((s, p) => s + p.amount, 0) },
    { name: 'Kart', value: payments.filter((p) => p.type === 'card').reduce((s, p) => s + p.amount, 0) },
    { name: 'Havale', value: payments.filter((p) => p.type === 'transfer').reduce((s, p) => s + p.amount, 0) },
  ].filter(s => s.value > 0);

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Raporlar hesaplanıyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Analitik & Raporlar</h1>
            <p className="page-subtitle">İş performansınızı takip edin</p>
          </div>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Raporu CSV İndir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Toplam Gelir', value: formatCurrency(totalRevenue), icon: <CreditCard size={20} />, color: '#10b981', sub: 'Tüm zamanlar' },
          { label: 'Ortalama Sipariş', value: formatCurrency(avgOrderValue), icon: <ShoppingBag size={20} />, color: '#6366f1', sub: 'Sipariş başına' },
          { label: 'Toplam Müşteri', value: customers.length, icon: <Users size={20} />, color: '#f59e0b', sub: 'Kayıtlı' },
          { label: 'Sipariş Hacmi', value: orders.length, icon: <TrendingUp size={20} />, color: '#3b82f6', sub: 'Oluşturulan' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.sub}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: kpi.color, marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Aylık Gelir Dağılımı</h3>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }} formatter={(v: any) => [formatCurrency(v), 'Gelir']} />
                <Area type="monotone" dataKey="gelir" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Ödeme Yöntemleri</h3>
          {sectorBreakdown.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart width={180} height={180}>
                  <Pie data={sectorBreakdown} cx={85} cy={85} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {sectorBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </div>
              {sectorBreakdown.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCurrency(d.value)}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Veri Yok</div>
          )}
        </div>
      </div>
    </div>
  );
}
