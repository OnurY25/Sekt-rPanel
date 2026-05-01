'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getSectorConfig } from '@/lib/sectors';
import {
  LayoutDashboard, Users, ShoppingBag, CreditCard, Calendar,
  CheckSquare, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, FileText, ClipboardList, Wrench, Zap, Shield, Building2,
  HelpCircle, Package, Workflow,
} from 'lucide-react';

const getNavItems = (sector: string) => {
  const base = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Panel' },
    { href: '/dashboard/customers', icon: Users, label: 'Müşteriler' },
    { href: '/dashboard/orders', icon: ShoppingBag, label: sector === 'dental' ? 'Tedaviler' : sector === 'autoservice' ? 'Servis İşleri' : 'Siparişler' },
    { href: '/dashboard/appointments', icon: Calendar, label: 'Randevular' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Ödemeler' },
    { href: '/dashboard/tasks', icon: CheckSquare, label: 'Görevler' },
  ];

  const advanced = [
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analitik & Raporlar' },
    { href: '/dashboard/crm', icon: Workflow, label: 'CRM Pipeline' },
    { href: '/dashboard/files', icon: FileText, label: 'Dosya Yönetimi' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Bildirim Merkezi' },
    { href: '/dashboard/audit', icon: ClipboardList, label: 'Audit Log' },
    { href: '/dashboard/support', icon: HelpCircle, label: 'Destek Talepleri' },
  ];

  const system = [
    { href: '/dashboard/subscription', icon: Zap, label: 'Abonelik' },
    { href: '/dashboard/team', icon: Shield, label: 'Ekip & Yetkiler' },
    { href: '/dashboard/onboarding', icon: Package, label: 'Sektör Kurulum' },
    { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar' },
  ];

  return { base, advanced, system };
};

export default function Sidebar() {
  const { tenant, user, logout, sidebarOpen, toggleSidebar } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  if (!tenant) return null;

  const config = getSectorConfig(tenant.sector);
  const { base, advanced, system } = getNavItems(tenant.sector);

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import('@/app/actions/auth');
      await logoutAction();
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const NavSection = ({ title, items }: { title?: string; items: typeof base }) => (
    <div style={{ marginBottom: '8px' }}>
      {title && sidebarOpen && (
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 14px 4px', marginTop: '8px' }}>
          {title}
        </div>
      )}
      {items.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`sidebar-nav-item ${isActive(href) ? 'active' : ''}`}
          title={!sidebarOpen ? label : undefined}
        >
          <Icon size={18} className="icon" />
          {sidebarOpen && <span style={{ flex: 1 }}>{label}</span>}
        </Link>
      ))}
    </div>
  );

  return (
    <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '64px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: config.gradient.includes('violet') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
            config.gradient.includes('amber') ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
            config.gradient.includes('emerald') ? 'linear-gradient(135deg, #10b981, #059669)' :
            config.gradient.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
            'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: `0 4px 12px ${config.color}40`,
        }}>
          {config.icon}
        </div>
        {sidebarOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tenant.company_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {config.label} · {tenant.plan.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <NavSection items={base} />
        <NavSection title="Gelişmiş" items={advanced} />
        <NavSection title="Sistem" items={system} />
      </nav>

      {/* User Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 8px' }}>
        <div className="sidebar-nav-item" style={{ cursor: 'default' }}>
          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '13px', flexShrink: 0 }}>
            {user?.name?.charAt(0)}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
              title="Çıkış Yap"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'absolute', right: '-12px', top: '80px',
          width: '24px', height: '24px', borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
