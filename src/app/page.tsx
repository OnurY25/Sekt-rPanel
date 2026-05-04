'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MOCK_TENANTS } from '@/lib/mockData';
import { loginAction } from '@/app/actions/auth';
import { User, Tenant } from '@/types';
import { Eye, EyeOff, Zap, Shield, BarChart3, Users, Sparkles, Layout, Globe, ChevronRight, CheckCircle2 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'terzi@demo.com', label: 'Terzi Atölyesi', icon: '✂️', color: '#8B5CF6' },
  { email: 'mobilya@demo.com', label: 'Mobilyacı', icon: '🪑', color: '#F59E0B' },
  { email: 'klinik@demo.com', label: 'Diş Kliniği', icon: '🦷', color: '#10B981' },
  { email: 'matbaa@demo.com', label: 'Matbaa', icon: '🖨️', color: '#3B82F6' },
  { email: 'servis@demo.com', label: 'Oto Servis', icon: '🔧', color: '#EF4444' },
];

export default function LandingPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  
  // Login State
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

      setAuth(user, tenant, 'supabase-secure-session');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  const scrollToLogin = () => {
    document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', overflowX: 'hidden' }}>
      {/* Dynamic Background */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>SektörPanel</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#a1a1aa' }}>
          <a href="#features" style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target as any).style.color = '#fff'} onMouseLeave={(e) => (e.target as any).style.color = '#a1a1aa'}>Özellikler</a>
          <a href="#sectors" style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target as any).style.color = '#fff'} onMouseLeave={(e) => (e.target as any).style.color = '#a1a1aa'}>Sektörler</a>
          <button onClick={scrollToLogin} style={{ padding: '10px 20px', borderRadius: '8px', background: '#fff', color: '#000', fontWeight: '600', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.target as any).style.transform = 'scale(1.05)'} onMouseLeave={(e) => (e.target as any).style.transform = 'scale(1)'}>
            Giriş Yap
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 1, padding: '160px 20px 100px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
          <Sparkles size={14} /> Claude 4.6 Sonnet AI Entegre Edildi
        </div>
        
        <h1 style={{ fontSize: '72px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' }}>
          İşletmeniz İçin <br />
          <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Yeni Nesil İşletim Sistemi
          </span>
        </h1>
        
        <p style={{ fontSize: '20px', color: '#a1a1aa', maxWidth: '600px', lineHeight: 1.6, marginBottom: '40px' }}>
          Sektörünüze özel özelleştirilmiş, yapay zeka destekli, her cihazda çalışan bulut tabanlı yönetim paneli ile işlerinizi zahmetsizce büyütün.
        </p>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={scrollToLogin} style={{ padding: '16px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(99,102,241,0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget as any).style.transform = 'translateY(-2px)'} onMouseLeave={(e) => (e.currentTarget as any).style.transform = 'translateY(0)'}>
            Hemen Başlayın <ChevronRight size={18} />
          </button>
          <a href="#features" style={{ padding: '16px 32px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget as any).style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => (e.currentTarget as any).style.background = 'rgba(255,255,255,0.05)'}>
            Özellikleri İncele
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '16px' }}>İhtiyacınız Olan Her Şey</h2>
          <p style={{ fontSize: '16px', color: '#a1a1aa' }}>Farklı yazılımlara para ödemeyi bırakın. Tüm işiniz tek bir platformda.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: <Layout size={24} />, title: 'Sektörel Özelleştirme', desc: 'Diş klinikleri için "Tedavi", mobilyacılar için "İmalat" modülü. Sektörünüze otomatik uyum sağlar.', color: '#3b82f6' },
            { icon: <Sparkles size={24} />, title: 'Yapay Zeka (Claude 4.6)', desc: 'Finansal verilerinizi analiz eden, size tavsiyeler veren ve mesaj metinleri oluşturan akıllı asistan.', color: '#a855f7' },
            { icon: <BarChart3 size={24} />, title: 'Finans ve Raporlama', desc: 'Aylık cironuzu, en iyi müşterilerinizi ve ödemelerinizi gerçek zamanlı, şık grafiklerle takip edin.', color: '#10b981' },
            { icon: <Users size={24} />, title: 'Müşteri ve Randevu CRM', desc: 'Müşteri geçmişini tutun, takipler yapın, randevuları ve görevleri bir Kanban panosunda yönetin.', color: '#f59e0b' },
            { icon: <Shield size={24} />, title: 'Banka Düzeyinde Güvenlik', desc: 'Supabase RLS altyapısıyla her veri kiracılara özel (multi-tenant) olarak şifrelenir ve izole edilir.', color: '#ef4444' },
            { icon: <Globe size={24} />, title: 'Her Yerden Erişim', desc: 'Bilgisayarda, tablette veya telefonda... İnternetin olduğu her yerde işiniz her zaman elinizin altında.', color: '#06b6d4' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s, background 0.3s' }} onMouseEnter={(e) => { (e.currentTarget as any).style.transform = 'translateY(-5px)'; (e.currentTarget as any).style.background = 'rgba(255,255,255,0.04)'; }} onMouseLeave={(e) => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${f.color}20`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Login & Demo Section */}
      <section id="login-section" style={{ position: 'relative', zIndex: 1, padding: '100px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: '#0a0b0f', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          {/* Left Side: Information */}
          <div style={{ flex: 1, padding: '48px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '16px' }}>Hemen Giriş Yapın</h2>
            <p style={{ fontSize: '15px', color: '#a1a1aa', marginBottom: '32px' }}>Aşağıdaki örnek sektörlerden birine tıklayarak platformun gücünü canlı olarak test edebilirsiniz.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  onClick={() => handleLogin(d.email)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: '#f1f5f9', fontSize: '15px',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}15`; (e.currentTarget as HTMLElement).style.borderColor = `${d.color}40`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <span style={{ fontSize: '24px' }}>{d.icon}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: '700' }}>{d.label} Demo</div>
                    <div style={{ fontSize: '12px', color: '#8b9ab5' }}>{d.email}</div>
                  </div>
                  <ChevronRight size={18} style={{ color: d.color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Manual Login */}
          <div style={{ width: '400px', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Kendi Hesabınız</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>E-posta Adresi</label>
                <input
                  className="input"
                  type="email"
                  placeholder="ornek@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>Şifre</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} /> {error}
                </div>
              )}

              <button
                onClick={() => handleLogin()}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#fff', color: '#000', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(e) => (e.currentTarget as any).style.background = '#f4f4f5'}
                onMouseLeave={(e) => (e.currentTarget as any).style.background = '#fff'}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : 'Giriş Yap'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '14px' }}>
        <p>© 2026 SektörPanel. Tüm Hakları Saklıdır.</p>
        <p style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Made with <Zap size={14} color="#8b5cf6" /> by AI Engineering</p>
      </footer>
    </div>
  );
}

