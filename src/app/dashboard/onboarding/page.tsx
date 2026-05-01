'use client';

import { useStore } from '@/lib/store';
import { getSectorConfig, SECTOR_CONFIGS } from '@/lib/sectors';
import { Package, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const ONBOARDING_STEPS = [
  { id: 1, title: 'Sektör Seçimi', desc: 'Hangi sektörde faaliyet gösterdiğinizi belirtin', done: true },
  { id: 2, title: 'Firma Bilgileri', desc: 'Firma adı, adres ve iletişim bilgileri', done: true },
  { id: 3, title: 'İlk Müşteri', desc: 'İlk müşterinizi sisteme ekleyin', done: true },
  { id: 4, title: 'İlk Sipariş', desc: 'İlk siparişinizi oluşturun', done: false },
  { id: 5, title: 'Ödeme Yöntemi', desc: 'Abonelik için ödeme bilgileri', done: false },
  { id: 6, title: 'Ekip Üyesi Davet', desc: 'Çalışanlarınızı sisteme davet edin', done: false },
];

export default function OnboardingPage() {
  const { tenant } = useStore();
  if (!tenant) return null;

  const config = getSectorConfig(tenant.sector);
  const completedSteps = ONBOARDING_STEPS.filter((s) => s.done).length;
  const progress = Math.round((completedSteps / ONBOARDING_STEPS.length) * 100);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sistem Kurulumu</h1>
        <p className="page-subtitle">Platformu tam anlamıyla kullanmak için kurulumu tamamlayın</p>
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Kurulum İlerlemesi</span>
          <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: "'Space Grotesk', sans-serif", color: '#818cf8' }}>%{progress}</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {completedSteps} / {ONBOARDING_STEPS.length} adım tamamlandı
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {ONBOARDING_STEPS.map((step, i) => (
          <div key={step.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', opacity: step.done ? 1 : 0.7 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.done ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `2px solid ${step.done ? '#10b981' : 'var(--border)'}` }}>
              {step.done ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>{step.id}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: step.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.desc}</div>
            </div>
            {!step.done && (
              <button className="btn btn-primary btn-sm">
                Tamamla <ArrowRight size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Sector Templates */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Sektör Şablonları</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Her sektör için hazır iş akışları ve ayarlar</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {Object.values(SECTOR_CONFIGS).map((sec) => (
            <div key={sec.id} style={{
              padding: '16px', borderRadius: '12px',
              background: sec.id === tenant.sector ? `${sec.color}15` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${sec.id === tenant.sector ? sec.color : 'var(--border)'}40`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{sec.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: sec.id === tenant.sector ? sec.color : 'var(--text-primary)', marginBottom: '4px' }}>{sec.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sec.description}</div>
              {sec.id === tenant.sector && (
                <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '700', color: sec.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={10} /> Aktif
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
