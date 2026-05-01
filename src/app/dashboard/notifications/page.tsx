'use client';

import { useStore } from '@/lib/store';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info: { icon: <Info size={16} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Bilgi' },
  success: { icon: <CheckCircle size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Başarı' },
  warning: { icon: <AlertTriangle size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Uyarı' },
  error: { icon: <XCircle size={16} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Hata' },
};

const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', title: 'Yeni Sipariş Oluşturuldu', message: 'Ahmet Yılmaz için yeni takım elbise siparişi oluşturuldu.', type: 'success' as const, read: false, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n2', title: 'Randevu Hatırlatması', message: 'Fatma Kaya ile yarın saat 11:30\'da randevunuz var.', type: 'info' as const, read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', title: 'Ödeme Alındı', message: 'Mehmet Demir\'den ₺5.200 ödeme alındı.', type: 'success' as const, read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'n4', title: 'Geciken Sipariş', message: 'Zeynep Arslan siparişinin teslim tarihi geçti!', type: 'warning' as const, read: false, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 'n5', title: 'Düşük Stok Uyarısı', message: 'Lacivert kumaş stoğu kritik seviyede.', type: 'warning' as const, read: true, created_at: new Date(Date.now() - 28800000).toISOString() },
];

function getTimeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (hours >= 1) return `${hours} saat önce`;
  return `${minutes} dakika önce`;
}

export default function NotificationsPage() {
  const { notifications, markAllRead } = useStore();
  const allNotifs = [...SAMPLE_NOTIFICATIONS, ...notifications];
  const unread = allNotifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Bildirim Merkezi</h1>
            <p className="page-subtitle">{unread} okunmamış bildirim</p>
          </div>
          {unread > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              <Check size={14} /> Tümünü Okundu İşaretle
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="stat-card" style={{ border: `1px solid ${cfg.color}20`, background: cfg.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: cfg.color }}>
              {cfg.icon}
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{cfg.label}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: cfg.color }}>
              {allNotifs.filter((n) => n.type === type).length}
            </div>
          </div>
        ))}
      </div>

      {/* Notification List */}
      <div className="card" style={{ padding: '8px 0' }}>
        {allNotifs.map((notif) => {
          const cfg = TYPE_CONFIG[notif.type];
          return (
            <div key={notif.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              background: notif.read ? 'transparent' : `${cfg.color}05`,
              transition: 'background 0.2s',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{notif.title}</span>
                  {!notif.read && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.5 }}>{notif.message}</p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{getTimeAgo(notif.created_at)}</span>
              </div>
              <span className={`badge`} style={{ fontSize: '11px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, flexShrink: 0 }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Channel Settings */}
      <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Bildirim Kanalları</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Uygulama İçi Bildirimler', desc: 'Sistem bildirimleri ve uyarılar', active: true },
            { label: 'E-posta Bildirimleri', desc: 'Sipariş ve randevu bildirimleri', active: true },
            { label: 'SMS Bildirimleri', desc: 'Kritik uyarılar (Pro+ plan)', active: false, locked: true },
            { label: 'WhatsApp Entegrasyonu', desc: 'Müşteri mesajlaşması (Enterprise)', active: false, locked: true },
          ].map((ch, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: ch.locked ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: '2px' }}>
                  {ch.label} {ch.locked && <span style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '8px', marginLeft: '6px' }}>PRO</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ch.desc}</div>
              </div>
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px', cursor: ch.locked ? 'not-allowed' : 'pointer',
                background: ch.active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease', position: 'relative',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '3px',
                  left: ch.active ? '23px' : '3px',
                  transition: 'left 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
