'use client';

import { useStore } from '@/lib/store';
import { getSectorConfig } from '@/lib/sectors';
import {
  generateMockStats, generateMockOrders, generateMockAppointments,
  generateMockTasks, generateMockPayments, generateMonthlyRevenue, generateWeeklyRevenue,
} from '@/lib/mockData';
import { STATUS_COLORS, getStatusLabel } from '@/lib/sectors';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingBag, CreditCard, Clock, Calendar, CheckSquare, ArrowUpRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { tenant } = useStore();
  if (!tenant) return null;

  const config = getSectorConfig(tenant.sector);
  const stats = generateMockStats();
  const orders = generateMockOrders();
  const appointments = generateMockAppointments();
  const tasks = generateMockTasks();
  const payments = generateMockPayments();
  const monthly = generateMonthlyRevenue();
  const weekly = generateWeeklyRevenue();

  const todayAppointments = appointments.filter((a) => a.status === 'scheduled').slice(0, 4);
  const recentOrders = orders.slice(0, 5);
  const pendingTasks = tasks.filter((t) => t.status !== 'done').slice(0, 4);

  const orderStatusData = [
    { name: 'Beklemede', value: orders.filter((o) => o.status === 'pending').length },
    { name: 'Devam Eden', value: orders.filter((o) => o.status === 'in_progress').length },
    { name: 'Hazır', value: orders.filter((o) => o.status === 'ready').length },
    { name: 'Teslim', value: orders.filter((o) => o.status === 'delivered').length },
    { name: 'İptal', value: orders.filter((o) => o.status === 'cancelled').length },
  ].filter((d) => d.value > 0);

  const STAT_CARDS = [
    {
      label: 'Toplam Müşteri',
      value: stats.total_customers,
      icon: <Users size={20} />,
      color: '#6366f1',
      change: '+12%',
      up: true,
    },
    {
      label: 'Aktif Siparişler',
      value: stats.pending_orders,
      icon: <ShoppingBag size={20} />,
      color: '#f59e0b',
      change: '+3',
      up: true,
    },
    {
      label: 'Bu Ay Gelir',
      value: formatCurrency(stats.revenue_this_month),
      icon: <CreditCard size={20} />,
      color: '#10b981',
      change: '+8.4%',
      up: true,
    },
    {
      label: "Bugün Randevu",
      value: stats.todays_appointments ?? 0,
      icon: <Calendar size={20} />,
      color: '#3b82f6',
      change: 'bugün',
      up: true,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px' }}>
              {config.icon} {config.label}
            </h1>
            <p className="page-subtitle">{tenant.company_name} · Hoş geldiniz 👋</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/orders" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
              + Yeni {tenant.sector === 'dental' ? 'Tedavi' : tenant.sector === 'autoservice' ? 'Servis' : 'Sipariş'}
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="stat-card" style={{ '--tw-ring-color': card.color } as any}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${card.color}20`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: card.up ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '16px', marginBottom: '20px' }}>
        {/* Monthly Revenue */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Aylık Gelir</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Son 6 ay</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
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

        {/* Weekly */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Bu Hafta</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Günlük gelir</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barSize={24}>
                <XAxis dataKey="gun" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px' }}
                  formatter={(v: any) => [formatCurrency(v), 'Gelir']}
                />
                <Bar dataKey="gelir" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Sipariş Durumu</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={150} height={150}>
              <Pie data={orderStatusData} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {orderStatusData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
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

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Son Siparişler</h3>
            <Link href="/dashboard/orders" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Tümü <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOrders.map((order) => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', borderRadius: '8px' }}>
                  {order.customer?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customer?.name}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status]}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {getStatusLabel(tenant.sector, order.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Bugünkü Randevular</h3>
            <Link href="/dashboard/appointments" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Tümü <ArrowUpRight size={12} />
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <Calendar size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <span style={{ fontSize: '13px' }}>Bugün randevu yok</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todayAppointments.map((appt) => (
                <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ width: '40px', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: '#818cf8', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '4px 0' }}>
                    {appt.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{appt.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{appt.service}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Bekleyen Görevler</h3>
            <Link href="/dashboard/tasks" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Tümü <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingTasks.map((task) => {
              const priorityColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#8b9ab5';
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: priorityColor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{task.title}</div>
                    {task.due_date && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {task.due_date}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {task.status === 'in_progress' ? 'Devam' : 'Bekliyor'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
