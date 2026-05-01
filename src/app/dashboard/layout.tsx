'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIAssistant from '@/components/AIAssistant';
import { getSectorConfig } from '@/lib/sectors';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tenant } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Try to restore from localStorage
    const stored_user = localStorage.getItem('saas_user');
    const stored_tenant = localStorage.getItem('saas_tenant');
    const stored_token = localStorage.getItem('saas_token');

    if (!isAuthenticated) {
      if (stored_user && stored_tenant && stored_token) {
        const { setAuth } = useStore.getState();
        setAuth(JSON.parse(stored_user), JSON.parse(stored_tenant), stored_token);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !tenant) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const config = getSectorConfig(tenant.sector);
  const sectorClass = `sector-${tenant.sector}`;

  return (
    <div className={`app-layout ${sectorClass}`}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-content">
          {children}
        </main>
        <AIAssistant />
      </div>
    </div>
  );
}
