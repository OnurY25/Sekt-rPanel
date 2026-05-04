'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Check, Zap, Star, Crown, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';

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
    ],
  },
];

export default function SubscriptionPage() {
  const { tenant } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!tenant) return null;

  const isTrial = tenant.plan === 'trial';
  const expiryDate = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const isExpired = isTrial && new Date() > expiryDate;
  const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Abonelik ve Plan Yönetimi</h1>
        <p className="page-subtitle">İşletmenizin ihtiyaçlarına en uygun planı seçerek hemen yükseltin.</p>
      </div>

      {/* Current Plan Banner */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px', background: isTrial ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))' : 'rgba(16,185,129,0.05)', border: isTrial ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: isTrial ? '#818cf8' : '#10b981', background: isTrial ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                {isTrial ? 'Ücretsiz Deneme Sürümü' : 'Aktif Plan'}
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
              {isTrial ? '5 Günlük Deneme Paketi' : `${tenant.plan.toUpperCase()} Plan`}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isTrial ? (
                <>⏳ {isExpired ? 'Süreniz doldu.' : `Kullanım sürenizin bitmesine ${daysLeft} gün kaldı.`} (Bitiş: {expiryDate.toLocaleDateString('tr-TR')})</>
              ) : (
                <>✅ Bir sonraki ödeme tarihi: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')}</>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {isTrial ? (
              <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Maliyet</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Ücretsiz</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                  ₺{tenant.plan === 'starter' ? '2.999' : tenant.plan === 'pro' ? '5.999' : '9.999'}
                  <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-muted)' }}>/ay</span>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>Kartı Güncelle</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: billingCycle === 'monthly' ? '#fff' : '#71717a' }}>Aylık</span>
        <div 
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          style={{ width: '48px', height: '24px', borderRadius: '20px', background: '#27272a', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
        >
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: billingCycle === 'monthly' ? '3px' : '27px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', color: billingCycle === 'yearly' ? '#fff' : '#71717a' }}>
          Yıllık <span style={{ color: '#10b981', fontSize: '12px' }}>(%20 İndirim)</span>
        </span>
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === tenant.plan;
          const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <div key={plan.id} className="card" style={{
              padding: '32px',
              border: plan.popular ? `2px solid ${plan.color}80` : isCurrentPlan ? '2px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
              position: 'relative',
              background: plan.popular ? `radial-gradient(circle at top, ${plan.color}10, transparent)` : undefined,
              display: 'flex', flexDirection: 'column',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${plan.color}, #8b5cf6)`,
                  color: 'white', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '4px 14px', borderRadius: '20px', boxShadow: `0 4px 12px ${plan.color}40`,
                }}>
                  En Çok Tercih Edilen
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${plan.color}15`, color: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {plan.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif" }}>{plan.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{plan.description}</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '40px', fontWeight: '900', color: 'var(--text-primary)' }}>₺{price.toLocaleString('tr-TR')}</span>
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ay</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                    Yıllık toplam: {formatCurrency(price * 12)} — {formatCurrency(plan.price * 12 - price * 12)} tasarruf
                  </div>
                )}
              </div>

              <button
                className="btn"
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', marginBottom: '24px',
                  background: isCurrentPlan ? 'rgba(255,255,255,0.05)' : plan.popular ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
                  color: isCurrentPlan ? 'var(--text-muted)' : plan.popular ? '#fff' : '#000',
                  fontWeight: '700', fontSize: '15px', border: 'none',
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                  boxShadow: isCurrentPlan ? 'none' : '0 8px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                }}
                disabled={isCurrentPlan}
                onMouseEnter={(e) => !isCurrentPlan && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !isCurrentPlan && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isCurrentPlan ? 'Şu Anki Planınız' : 'Hemen Yükselt'} {!isCurrentPlan && <ArrowRight size={16} style={{ marginLeft: '8px' }} />}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${plan.color}15`, color: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} strokeWidth={4} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Security Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '32px', borderTop: '1px solid var(--border)', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={20} color="#10b981" /> 256-bit SSL ile Güvenli Ödeme
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <CreditCard size={20} color="#6366f1" /> Iyzico Güvencesiyle 
        </div>
      </div>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
}
