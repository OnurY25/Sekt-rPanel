'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { getSectorConfig, STATUS_COLORS, getStatusLabel } from '@/lib/sectors';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingBag, CreditCard, Clock, Calendar, CheckSquare, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { tenant } = useStore();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_customers: 0,
    pending_orders: 0,
    revenue_this_month: 0,
    todays_appointments: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (tenant?.id) {
      fetchDashboardData();
    }
  }, [tenant?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch all needed counts and sums
    const [custRes, orderRes, payRes, apptRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, status, title, created_at, customer:customers(name)'),
      supabase.from('payments').select('amount, paid_at'),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('date', new Date().toISOString().split('T')[0])
    ]);

    // Calculate Stats
    const totalCustomers = custRes.count || 0;
    const orders = orderRes.data || [];
    const pendingOrders = orders.filter(o => ['pending', 'in_progress'].includes(o.status)).length;
    
    // Revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = (payRes.data || [])
      .filter(p => new Date(p.paid_at) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      total_customers: totalCustomers,
      pending_orders: pendingOrders,
      revenue_this_month: monthlyRevenue,
      todays_appointments: apptRes.count || 0
    });

    // Recent Orders
    setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));

    // Status Pie Chart
    const statusCounts = orders.reduce((acc: any, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    
    setOrderStatusData([
      { name: 'Beklemede', value: statusCounts['pending'] || 0 },
      { name: 'Devam Eden', value: statusCounts['in_progress'] || 0 },
      { name: 'Hazır', value: statusCounts['ready'] || 0 },
      { name: 'Teslim', value: statusCounts['delivered'] || 0 },
    ].filter(d => d.value > 0));

    // Simple Monthly Chart Logic (Current month)
    setChartData([
      { month: 'Ocak', gelir: 0 },
      { month: 'Şubat', gelir: 0 },
      { month: 'Mart', gelir: 0 },
      { month: 'Nisan', gelir: 0 },
      { month: 'Mayıs', gelir: monthlyRevenue },
    ]);

    setLoading(false);
  };

  if (!tenant) return null;
  const config = getSectorConfig(tenant.sector);

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={40} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Veriler veritabanından çekiliyor...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: 'Toplam Müşteri',
      value: stats.total_customers,
      icon: <Users size={20} />,
      color: '#6366f1',
      change: '+0',
      up: true,
    },
    {
      label: 'Aktif Siparişler',
      value: stats.pending_orders,
      icon: <ShoppingBag size={20} />,
      color: '#f59e0b',
      change: 'aktif',
      up: true,
    },
    {
      label: 'Bu Ay Gelir',
      value: formatCurrency(stats.revenue_this_month),
      icon: <CreditCard size={20} />,
      color: '#10b981',
      change: '₺',
      up: true,
    },
    {
      label: "Bugün Randevu",
      value: stats.todays_appointments,
      icon: <Calendar size={20} />,
      color: '#3b82f6',
      change: 'bugün',
      up: true,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px' }}>
              {config.icon} {config.label} Paneli
            </h1>
            <p className="page-subtitle">{tenant.company_name} · Hoş geldiniz 👋</p>
          </div>
          <Link href="/dashboard/orders" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
            + Yeni İşlem
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${card.color}20`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: card.up ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {card.change}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)', marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Aylık Gelir Akışı</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2024</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }}
                  formatter={(v: any) => [formatCurrency(v), 'Gelir']}
                />
                <Area type="monotone" dataKey="gelir" stroke="#6366f1" strokeWidth={2} fill="url(#colorGelir)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Sipariş Dağılımı</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={orderStatusData} cx={80} cy={80} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {orderStatusData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
            {orderStatusData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Son Siparişler</h3>
            <Link href="/dashboard/orders" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>Tümü →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOrders.map((order) => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', borderRadius: '8px' }}>
                  {order.customer?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{order.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customer?.name}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status]}`} style={{ fontSize: '10px' }}>
                  {getStatusLabel(tenant.sector, order.status)}
                </span>
              </div>
            ))}
            {recentOrders.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Sipariş bulunmuyor</div>}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>İşlem Kayıtları</h3>
            <Link href="/dashboard/audit" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>Tümü →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '2px', background: '#10b981', borderRadius: '1px' }} />
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>Sistem başarıyla canlıya bağlandı.</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Şimdi</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '2px', background: '#6366f1', borderRadius: '1px' }} />
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>Veritabanı senkronizasyonu tamamlandı.</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1 dakika önce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
