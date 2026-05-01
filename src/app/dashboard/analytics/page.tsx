'use client';

import { useStore } from '@/lib/store';
import { generateMonthlyRevenue, generateWeeklyRevenue, generateMockOrders, generateMockCustomers, generateMockPayments } from '@/lib/mockData';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, CreditCard, ShoppingBag, Download } from 'lucide-react';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function AnalyticsPage() {
  const { tenant } = useStore();
  const monthly = generateMonthlyRevenue();
  const weekly = generateWeeklyRevenue();
  const orders = generateMockOrders();
  const customers = generateMockCustomers();
  const payments = generateMockPayments();

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const avgOrderValue = orders.length ? orders.reduce((s, o) => s + o.price, 0) / orders.length : 0;

  const customerAcquisition = [
    { month: 'Oca', yeni: 3 },
    { month: 'Şub', yeni: 5 },
    { month: 'Mar', yeni: 2 },
    { month: 'Nis', yeni: 7 },
    { month: 'May', yeni: 4 },
  ];

  const sectorBreakdown = [
    { name: 'Nakdi', value: payments.filter((p) => p.type === 'cash').reduce((s, p) => s + p.amount, 0) },
    { name: 'Kartlı', value: payments.filter((p) => p.type === 'card').reduce((s, p) => s + p.amount, 0) },
    { name: 'Transfer', value: payments.filter((p) => p.type === 'transfer').reduce((s, p) => s + p.amount, 0) },
  ];

  const topCustomers = [...customers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Analitik & Raporlar</h1>
            <p className="page-subtitle">İş performansınızı takip edin</p>
          </div>
          <button className="btn btn-secondary">
            <Download size={16} /> Raporu İndir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Toplam Gelir', value: formatCurrency(totalRevenue), icon: <CreditCard size={20} />, color: '#10b981', sub: 'Tüm zamanlar' },
          { label: 'Ortalama Sipariş', value: formatCurrency(avgOrderValue), icon: <ShoppingBag size={20} />, color: '#6366f1', sub: 'Sipariş başına' },
          { label: 'Toplam Müşteri', value: customers.length, icon: <Users size={20} />, color: '#f59e0b', sub: 'Kayıtlı' },
          { label: 'Büyüme', value: '+24%', icon: <TrendingUp size={20} />, color: '#3b82f6', sub: 'Önceki aya göre' },
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
            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Aylık Gelir Trendi</h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>+8.4% bu ay</span>
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
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Ödeme Dağılımı</h3>
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
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Haftalık Gelir</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barSize={28}>
                <XAxis dataKey="gun" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }} formatter={(v: any) => [formatCurrency(v), 'Gelir']} />
                <Bar dataKey="gelir" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Yeni Müşteri Kazanımı</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerAcquisition}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="yeni" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>En İyi Müşteriler</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topCustomers.map((c, i) => {
            const maxSpent = topCustomers[0].total_spent || 1;
            const pct = ((c.total_spent || 0) / maxSpent) * 100;
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', fontSize: '13px', fontWeight: '700', color: i === 0 ? '#f59e0b' : 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</div>
                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', borderRadius: '8px', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{formatCurrency(c.total_spent || 0)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.total_orders} sipariş</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
