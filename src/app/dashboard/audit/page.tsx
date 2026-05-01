'use client';

import { generateMockAuditLogs } from '@/lib/mockData';
import { ClipboardList, User, Clock } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  'Sipariş Oluşturdu': '#6366f1',
  'Müşteri Güncelledi': '#3b82f6',
  'Ödeme Kaydetti': '#10b981',
  'Sipariş Durumu Güncelledi': '#f59e0b',
  'Randevu Oluşturdu': '#8b5cf6',
  'Görev Tamamladı': '#10b981',
};

export default function AuditPage() {
  const logs = generateMockAuditLogs();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Sistemdeki tüm işlem kayıtları</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Bugünkü İşlem', value: logs.length, color: '#6366f1' },
          { label: 'Aktif Kullanıcı', value: 2, color: '#10b981' },
          { label: 'Kritik İşlem', value: 0, color: '#ef4444' },
          { label: 'Bu Ay Toplam', value: 142, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>İşlem Geçmişi</span>
        </div>
        <div style={{ padding: '8px 0' }}>
          {logs.map((log) => {
            const actionColor = ACTION_COLORS[log.action] || '#8b9ab5';
            const timeAgo = getTimeAgo(log.created_at);
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${actionColor}15`, border: `1px solid ${actionColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: actionColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{log.user_name}</span>
                    <span style={{ fontSize: '13px', color: actionColor, fontWeight: '500' }}>{log.action}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {log.entity} · ID: {log.entity_id}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <Clock size={11} /> {timeAgo}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (hours >= 1) return `${hours} saat önce`;
  return `${minutes} dakika önce`;
}
