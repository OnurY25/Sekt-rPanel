'use client';

import { useEffect, useState } from 'react';
import { useStore, loadSession, clearSession } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIAssistant from '@/components/AIAssistant';
import { getSectorConfig } from '@/lib/sectors';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tenant, setAuth } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If already in memory (e.g. navigated from login page)
    if (isAuthenticated && tenant) {
      sessionStorage.removeItem('_dash_attempts');
      setReady(true);
      return;
    }

    // Döngü tespiti: aynı sekmedeki yönlendirme sayısını takip et
    const attempts = parseInt(sessionStorage.getItem('_dash_attempts') || '0', 10);
    if (attempts >= 2) {
      // Bozuk/döngüsel session → temizle ve giriş sayfasına yönlendir
      console.warn('[Dashboard] Bozuk oturum tespit edildi, temizleniyor...');
      sessionStorage.removeItem('_dash_attempts');
      clearSession();
      window.location.replace('/?reset=1');
      return;
    }
    sessionStorage.setItem('_dash_attempts', String(attempts + 1));

    const session = loadSession();
    if (session) {
      setAuth(session.user, session.tenant, session.token);
      setReady(true);
    } else {
      clearSession();
      window.location.replace('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: [] is intentional — we only want to run this once on mount.
  // If isAuthenticated changes, the component will re-render and show the dashboard.

  if (!ready || !isAuthenticated || !tenant) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050505' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const sectorClass = `sector-${tenant.sector}`;
  const isTrial = tenant.plan === 'trial';
  const expiryDate = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : new Date(Date.now() + 5 * 86400000);
  const isExpired = isTrial && new Date() > expiryDate;
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);

  return (
    <div className={`app-layout ${sectorClass}`}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {isTrial && !isExpired && (
          <div style={{ background: 'linear-gradient(to right,rgba(99,102,241,.08),rgba(168,85,247,.08))', padding: '10px 24px', borderBottom: '1px solid rgba(99,102,241,.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#e2e8f0' }}>
            <span style={{ color: '#a855f7' }}>✨ Deneme Sürümü:</span> {daysLeft} gününüz kaldı.
            <a href="/dashboard/subscription" style={{ color: '#818cf8', textDecoration: 'underline', fontWeight: 600 }}>Hemen Yükselt</a>
          </div>
        )}
        <main className="page-content">
          {isExpired ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 24 }}>⏳</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Deneme Süreniz Doldu</h2>
              <a href="/dashboard/subscription" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', borderRadius: 12, textDecoration: 'none' }}>Planları İncele</a>
            </div>
          ) : children}
        </main>
        {!isExpired && <AIAssistant />}
      </div>
    </div>
  );
}
