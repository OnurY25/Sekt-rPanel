'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MOCK_TENANTS } from '@/lib/mockData';
import { loginAction } from '@/app/actions/auth';
import { User, Tenant } from '@/types';
import { Eye, EyeOff, Zap, Shield, BarChart3, Users } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'terzi@demo.com', label: 'Terzi Atölyesi', icon: '✂️', color: '#8B5CF6' },
  { email: 'mobilya@demo.com', label: 'Mobilyacı', icon: '🪑', color: '#F59E0B' },
  { email: 'klinik@demo.com', label: 'Diş Kliniği', icon: '🦷', color: '#10B981' },
  { email: 'matbaa@demo.com', label: 'Matbaa', icon: '🖨️', color: '#3B82F6' },
  { email: 'servis@demo.com', label: 'Oto Servis', icon: '🔧', color: '#EF4444' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (loginEmail?: string) => {
    const e = loginEmail || email;
    if (!e) {
      setError('Lütfen e-posta adresi girin.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await loginAction(e, password || 'Demo1234!');
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // If successful, Supabase handles the session via HttpOnly cookies!
      // But we still update Zustand to tell the UI we are authenticated,
      // using our mock tenant data so the UI doesn't break until we build the DB fetchers.
      const tenantData = MOCK_TENANTS[e] || MOCK_TENANTS['admin@demo.com'];
      
      const user: User = {
        id: result.user?.id || 'u1',
        tenant_id: tenantData.id,
        name: result.profile?.name || tenantData.company + ' Admin',
        email: e,
        role: 'owner',
        created_at: new Date().toISOString(),
      };

      const tenant: Tenant = {
        id: tenantData.id,
        company_name: tenantData.company,
        sector: tenantData.sector as any,
        plan: tenantData.plan as any,
        status: 'active',
        created_at: new Date().toISOString(),
        currency: 'TRY',
        language: 'tr',
      };

      // Set auth locally for UI consistency
      setAuth(user, tenant, 'supabase-secure-session');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0f', display: 'flex' }}>
      {/* Left Panel */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a0b0f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', width: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              }}>
                <Zap size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: '#f1f5f9' }}>SektörPanel</div>
                <div style={{ fontSize: '12px', color: '#8b9ab5', fontWeight: '500' }}>Multi-Sector SaaS Platform</div>
              </div>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: '#f1f5f9', lineHeight: 1.2, marginBottom: '12px' }}>
              İşletmenizi<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                dijitale taşıyın
              </span>
            </h1>
            <p style={{ fontSize: '15px', color: '#8b9ab5', lineHeight: 1.6 }}>
              Terzi, mobilya, klinik, matbaa veya oto servise — her sektöre özel panel, tek platform.
            </p>
          </div>

          {/* Features */}
          {[
            { icon: <Shield size={16} />, text: 'Güvenli çok kiracılı mimari' },
            { icon: <BarChart3 size={16} />, text: 'Gerçek zamanlı analitik ve raporlar' },
            { icon: <Users size={16} />, text: 'Rol bazlı ekip yönetimi' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#8b9ab5', fontSize: '14px' }}>
              <div style={{ color: '#818cf8' }}>{f.icon}</div>
              {f.text}
            </div>
          ))}

          {/* Demo sectors preview */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DEMO_ACCOUNTS.map((d) => (
              <div key={d.email} style={{
                padding: '6px 12px',
                borderRadius: '20px',
                background: `${d.color}15`,
                border: `1px solid ${d.color}30`,
                fontSize: '13px',
                color: d.color,
                fontWeight: '500',
              }}>
                {d.icon} {d.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – Login Form */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px',
        background: '#111318',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Space Grotesk', sans-serif", color: '#f1f5f9', marginBottom: '8px' }}>Giriş Yap</h2>
        <p style={{ fontSize: '14px', color: '#8b9ab5', marginBottom: '32px' }}>Demo hesabı seçin veya bilgilerinizi girin</p>

        {/* Demo Quick Login */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Hızlı Demo Girişi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                onClick={() => handleLogin(d.email)}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  color: '#f1f5f9', fontSize: '14px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}15`; (e.currentTarget as HTMLElement).style.borderColor = `${d.color}40`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <span style={{ fontSize: '20px' }}>{d.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>{d.label}</div>
                  <div style={{ fontSize: '12px', color: '#4a5568' }}>{d.email}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: d.color, fontWeight: '600' }}>Giriş →</div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>VEYA</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Manual Login */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">E-posta</label>
            <input
              className="input"
              type="email"
              placeholder="ornek@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="input-label">Şifre</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{ paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => handleLogin()}
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '4px' }}
          >
            {loading ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : 'Giriş Yap'}
          </button>
        </div>

        <p style={{ marginTop: '24px', fontSize: '12px', color: '#4a5568', textAlign: 'center' }}>
          Demo mod — gerçek veri kullanılmamaktadır
        </p>
      </div>
    </div>
  );
}
