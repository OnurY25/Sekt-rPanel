'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Check, Zap, Star, Crown, ArrowRight, CreditCard, ShieldCheck, X } from 'lucide-react';

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
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);

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
                onClick={() => setCheckoutPlan({ ...plan, activePrice: price })}
                style={{
                  width: '100%', marginBottom: '20px',
                  background: isCurrentPlan ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: isCurrentPlan ? 'var(--text-muted)' : 'white',
                  boxShadow: isCurrentPlan ? 'none' : `0 4px 16px ${plan.color}40`,
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                }}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Mevcut Planınız' : 'Hemen Yükselt'} {!isCurrentPlan && <ArrowRight size={14} />}
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

      {/* Payment Security Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '32px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Zap size={20} color="#10b981" /> 256-bit SSL ile Güvenli Ödeme
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Star size={20} color="#f59e0b" /> LemonSqueezy Güvencesiyle
        </div>
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

      {/* LemonSqueezy Checkout Modal Simulation */}
      {checkoutPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px', background: '#ffffff', borderRadius: '24px', overflow: 'hidden', display: 'flex', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', color: '#111827' }}>
            <button onClick={() => setCheckoutPlan(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
              <X size={18} color="#4b5563" />
            </button>

            {/* Left Side: Summary */}
            <div style={{ width: '320px', background: '#f9fafb', padding: '40px', borderRight: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: '#111827', fontWeight: '800', fontSize: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                SektörPanel
              </div>
              
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Seçilen Plan</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>{checkoutPlan.name} Plan</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>{billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'} Abonelik</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <span style={{ color: '#4b5563' }}>Tutar</span>
                <span style={{ fontWeight: '600' }}>₺{checkoutPlan.activePrice.toLocaleString('tr-TR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <span style={{ color: '#4b5563' }}>KDV (%20)</span>
                <span style={{ fontWeight: '600' }}>₺{(checkoutPlan.activePrice * 0.2).toLocaleString('tr-TR')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
                <span>Toplam</span>
                <span>₺{(checkoutPlan.activePrice * 1.2).toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {/* Right Side: Payment Form */}
            <div style={{ flex: 1, padding: '40px' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Ödeme Bilgileri</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>E-posta Adresi</label>
                  <input type="email" defaultValue={tenant.company_name.toLowerCase().replace(' ', '') + '@ornek.com'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#fff', color: '#111827' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Kart Sahibi</label>
                  <input type="text" placeholder="Ad Soyad" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#fff', color: '#111827' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Kart Numarası</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#fff', color: '#111827', fontFamily: 'monospace', fontSize: '15px' }} />
                    <CreditCard size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Son Kullanma</label>
                    <input type="text" placeholder="AA / YY" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#fff', color: '#111827', textAlign: 'center' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>CVC</label>
                    <input type="text" placeholder="123" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#fff', color: '#111827', textAlign: 'center' }} />
                  </div>
                </div>
                
                <button
                  onClick={() => { alert('Bu bir LemonSqueezy demo testidir. Canlı ortamda gerçek ödeme penceresi açılacaktır.'); setCheckoutPlan(null); }}
                  style={{ width: '100%', padding: '16px', borderRadius: '8px', background: '#7047eb', color: '#fff', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '16px', boxShadow: '0 4px 12px rgba(112,71,235,0.3)' }}
                >
                  ₺{(checkoutPlan.activePrice * 1.2).toLocaleString('tr-TR')} Öde
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#10b981" /> Ödemeleriniz LemonSqueezy ile şifrelenir ve güvendedir.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
}
