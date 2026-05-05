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
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [debugLog, setDebugLog] = useState('Başlatılıyor...');

  useEffect(() => {
    console.log('[Dashboard] Mount oldu. Auth durumu:', isAuthenticated);
    setDebugLog('Oturum kontrol ediliyor...');

    // 1. Zaten bellekte varsa hemen hazırız
    if (isAuthenticated && tenant) {
      console.log('[Dashboard] Bellekte oturum bulundu.');
      setReady(true);
      return;
    }

    // 2. Bellekte yoksa localStorage'dan yükle
    try {
      const session = loadSession();
      if (session && session.user && session.tenant) {
        console.log('[Dashboard] LocalStorage oturumu yüklendi:', session.user.email);
        setAuth(session.user, session.tenant, session.token);
        setReady(true);
      } else {
        console.log('[Dashboard] Oturum bulunamadı, ana sayfaya yönlendiriliyor...');
        setDebugLog('Oturum bulunamadı, yönlendiriliyor...');
        router.replace('/');
      }
    } catch (err) {
      console.error('[Dashboard] Yükleme hatası:', err);
      setDebugLog('Hata oluştu, ana sayfaya dönülüyor...');
      router.replace('/');
    }

    // 3. Emniyet kilidi: 5 saniye sonra hala hazır değilse ana sayfaya at
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.warn('[Dashboard] Zaman aşımı! Yönlendiriliyor...');
        router.replace('/');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, tenant, router, setAuth]);

  // Yükleme ekranı
  if (!ready || !isAuthenticated || !tenant) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050505', color: 'white', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '14px', color: '#64748b' }}>{debugLog}</p>
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
          <div style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', padding: '12px 24px', borderBottom: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
            <span style={{ color: '#a855f7' }}>✨ Deneme Sürümü:</span> {daysLeft} gününüz kaldı.
            <a href="/dashboard/subscription" style={{ color: '#818cf8', textDecoration: 'underline', fontWeight: '600' }}>Hemen Yükselt</a>
          </div>
        )}

        <main className="page-content">
          {isExpired ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontSize: '32px' }}>⏳</div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Deneme Süreniz Doldu</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '32px' }}>Platformu kullanmaya devam etmek için profesyonel planlardan birine geçiş yapın.</p>
              <a href="/dashboard/subscription" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', borderRadius: '12px' }}>Planları İncele</a>
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
