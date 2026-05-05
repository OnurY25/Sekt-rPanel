'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, loadSession } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIAssistant from '@/components/AIAssistant';
import { getSectorConfig } from '@/lib/sectors';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tenant, setAuth } = useStore();
  const [ready, setReady] = useState(false);
  const [debugLog, setDebugLog] = useState('Sistem başlatılıyor...');

  useEffect(() => {
    // Already authenticated in memory
    if (isAuthenticated && tenant) {
      setReady(true);
      return;
    }

    const checkSession = () => {
      try {
        const session = loadSession();
        
        if (session && session.user?.id && session.tenant?.id) {
          console.log('[Dashboard] Oturum doğrulandı.');
          setAuth(session.user, session.tenant, session.token);
          setReady(true);
        } else {
          console.warn('[Dashboard] Oturum geçersiz.');
          setDebugLog('Oturum geçersiz, yönlendiriliyorsunuz...');
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
      }
    };

    const timer = setTimeout(checkSession, 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated, tenant, setAuth]);

  // Loading Screen
  if (!ready || !isAuthenticated || !tenant) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050505', color: 'white', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#e2e8f0' }}>Lütfen Bekleyin</p>
          <p style={{ fontSize: '13px', color: '#64748b' }}>{debugLog}</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const config = getSectorConfig(tenant.sector);
  const sectorClass = `sector-${tenant.sector}`;

  const isTrial = tenant.plan === 'trial';
  const trialEndsAt = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
  const expiryDate = trialEndsAt || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const isExpired = isTrial && new Date() > expiryDate;
  const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className={`app-layout ${sectorClass}`}>
      <Sidebar />
      <div className="main-content">
        <Topbar />

        {isTrial && !isExpired && (
          <div style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.05), rgba(168,85,247,0.05))', padding: '12px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
            <span style={{ color: '#a855f7' }}>✨ Deneme Sürümü:</span> {daysLeft} gününüz kaldı.
            <a href="/dashboard/subscription" style={{ color: '#818cf8', textDecoration: 'underline', fontWeight: '600' }}>Hemen Yükselt</a>
          </div>
        )}

        <main className="page-content">
          {isExpired ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '32px' }}>⏳</div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Deneme Süreniz Doldu</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '32px' }}>Platformu kullanmaya devam etmek için profesyonel planlardan birine geçiş yapın.</p>
              <a href="/dashboard/subscription" className="btn btn-primary" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '12px' }}>Planları İncele</a>
            </div>
          ) : (
            children
          )}
        </main>
        {!isExpired && <AIAssistant />}
      </div>
    </div>
  );
}
