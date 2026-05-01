'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Check, Zap, Star, Crown, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2999,
    icon: <Zap size={20} />,
    color: '#10b981',
    description: 'Küçük işletmeler için ideal başlangıç',
    features: [
      '1 Kullanıcı',
      '100 Müşteri',
      '200 Sipariş/ay',
      'Temel raporlar',
      'E-posta bildirimleri',
      'Destek: E-posta',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5999,
    icon: <Star size={20} />,
    color: '#6366f1',
    description: 'Büyüyen işletmeler için tam özellik seti',
    popular: true,
    features: [
      '5 Kullanıcı',
      'Sınırsız Müşteri',
      'Sınırsız Sipariş',
      'Gelişmiş analitik',
      'SMS + E-posta bildirimleri',
      'Dosya yönetimi',
      'CRM Pipeline',
      'Destek: Öncelikli',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9999,
    icon: <Crown size={20} />,
    color: '#f59e0b',
    description: 'Büyük ekipler ve çoklu şube yönetimi',
    features: [
      'Sınırsız Kullanıcı',
      'Sınırsız Her Şey',
      'Çoklu Şube Yönetimi',
      'AI Raporlar ve Öneriler',
      'WhatsApp Entegrasyonu',
      'Özel API erişimi',
      'Audit Log',
      'Destek: Özel Yönetici',
      'SLA Garantisi',
    ],
  },
];

export default function SubscriptionPage() {
  const { tenant } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!tenant) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Abonelik Yönetimi</h1>
        <p className="page-subtitle">Mevcut plan: <strong style={{ color: '#6366f1' }}>{tenant.plan.toUpperCase()}</strong> · Her zaman yükseltebilir veya düşürebilirsiniz</p>
      </div>

      {/* Current Plan Banner */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mevcut Plan</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: '#818cf8' }}>
              {tenant.plan.toUpperCase()} Plan
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Sonraki fatura: 1 Haziran 2024 · Otomatik yenileme aktif
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              ₺{tenant.plan === 'starter' ? '2.999' : tenant.plan === 'pro' ? '5.999' : '9.999'}
              <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-muted)' }}>/ay</span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>Faturayı Görüntüle</button>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div className="tabs" style={{ width: 'fit-content' }}>
          <button className={`tab ${billingCycle === 'monthly' ? 'active' : ''}`} onClick={() => setBillingCycle('monthly')}>Aylık</button>
          <button className={`tab ${billingCycle === 'yearly' ? 'active' : ''}`} onClick={() => setBillingCycle('yearly')}>
            Yıllık <span style={{ fontSize: '10px', color: '#10b981', marginLeft: '4px', fontWeight: '700' }}>%20 İndirim</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === tenant.plan;
          const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <div key={plan.id} className="card" style={{
              padding: '28px',
              border: plan.popular ? `1px solid ${plan.color}60` : isCurrentPlan ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
              position: 'relative',
              background: plan.popular ? `radial-gradient(circle at top, ${plan.color}08, transparent)` : undefined,
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: 'white', fontSize: '12px', fontWeight: '700',
                  padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
                }}>
                  En Popüler
                </div>
              )}
              {isCurrentPlan && (
                <div style={{
                  position: 'absolute', top: '-12px', right: '16px',
                  background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                  color: '#818cf8', fontSize: '11px', fontWeight: '700',
                  padding: '3px 12px', borderRadius: '20px',
                }}>
                  Mevcut Plan
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: plan.color }}>
                {plan.icon}
                <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>{plan.name}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{plan.description}</p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '900', fontFamily: "'Space Grotesk', sans-serif", color: plan.color }}>₺{price.toLocaleString('tr-TR')}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ay</span>
                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                    Yıllık {formatCurrency(price * 12)} — {formatCurrency(plan.price * 12 - price * 12)} tasarruf
                  </div>
                )}
              </div>

              <button
                className="btn"
                style={{
                  width: '100%', marginBottom: '20px',
                  background: isCurrentPlan ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: isCurrentPlan ? 'var(--text-muted)' : 'white',
                  boxShadow: isCurrentPlan ? 'none' : `0 4px 16px ${plan.color}40`,
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                }}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Mevcut Planınız' : 'Bu Plana Geç'} {!isCurrentPlan && <ArrowRight size={14} />}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Fatura Geçmişi</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Plan</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '01.05.2024', plan: 'Pro', amount: 5999, status: 'Ödendi' },
                { date: '01.04.2024', plan: 'Pro', amount: 5999, status: 'Ödendi' },
                { date: '01.03.2024', plan: 'Starter', amount: 2999, status: 'Ödendi' },
              ].map((inv, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '13px' }}>{inv.date}</td>
                  <td style={{ fontSize: '13px' }}>{inv.plan}</td>
                  <td style={{ fontWeight: '700', color: '#10b981' }}>₺{inv.amount.toLocaleString('tr-TR')}</td>
                  <td><span className="badge bg-green-500/20 text-green-400 border-green-500/30">{inv.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm">PDF İndir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
}
