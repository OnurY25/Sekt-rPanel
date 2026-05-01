'use client';

import { useStore } from '@/lib/store';
import { getSectorConfig } from '@/lib/sectors';
import { Bell, Search, Menu, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Topbar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { tenant, user, notifications, markAllRead, toggleSidebar } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!tenant || !user) return null;

  const config = getSectorConfig(tenant.sector);
  const unread = notifications.filter((n) => !n.read).length;

  const PLAN_COLORS: Record<string, string> = {
    trial: '#f59e0b',
    starter: '#10b981',
    pro: '#6366f1',
    enterprise: '#ec4899',
  };

  return (
    <header className="topbar" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={toggleSidebar} className="btn btn-secondary btn-icon" style={{ padding: '6px' }}>
          <Menu size={18} />
        </button>
        <div>
          {title && <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h1>}
          {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Ara..."
            style={{ width: '200px', paddingLeft: '30px', paddingTop: '6px', paddingBottom: '6px', fontSize: '13px' }}
          />
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            style={{ position: 'relative' }}
          >
            <Bell size={16} />
            {unread > 0 && <span className="notif-dot" />}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: '44px', right: 0,
              width: '340px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Bildirimler</span>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: '12px', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Bildirim bulunmuyor
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '10px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{config.icon} {tenant.company_name}</div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, width: '220px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                <span style={{
                  display: 'inline-block', marginTop: '6px', padding: '2px 8px',
                  borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                  background: `${PLAN_COLORS[tenant.plan]}20`,
                  color: PLAN_COLORS[tenant.plan],
                  border: `1px solid ${PLAN_COLORS[tenant.plan]}40`,
                }}>
                  {tenant.plan.toUpperCase()} Plan
                </span>
              </div>
              <div style={{ padding: '8px' }}>
                {[
                  { label: 'Profil Ayarları', href: '/dashboard/settings' },
                  { label: 'Abonelik', href: '/dashboard/subscription' },
                  { label: 'Ekip Yönetimi', href: '/dashboard/team' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
