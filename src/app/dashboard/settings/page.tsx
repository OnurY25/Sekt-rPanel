'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Save, Building2, User, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { tenant, user, addNotification } = useStore();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    sector: '',
    currency: 'TRY',
    language: 'tr'
  });

  useEffect(() => {
    if (tenant) {
      setForm({
        company_name: tenant.company_name || '',
        sector: tenant.sector || 'other',
        currency: tenant.currency || 'TRY',
        language: tenant.language || 'tr'
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenant?.id) return;
    setLoading(true);

    const { error } = await supabase
      .from('tenants')
      .update({
        company_name: form.company_name,
        sector: form.sector,
        currency: form.currency,
        language: form.language
      })
      .eq('id', tenant.id);

    if (error) {
      addNotification({ title: 'Hata', message: 'Ayarlar güncellenirken bir hata oluştu.', type: 'error' });
    } else {
      addNotification({ title: 'Başarılı', message: 'İşletme ayarları güncellendi. (Değişikliklerin tamamen yansıması için sayfayı yenilemeniz gerekebilir.)', type: 'success' });
    }

    setLoading(false);
  };

  if (!tenant) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ayarlar</h1>
        <p className="page-subtitle">İşletme profili ve platform tercihlerini yapılandırın.</p>
      </div>

      <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
        {/* İşletme Profili */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>İşletme Profili</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Temel işletme bilgilerinizi güncelleyin.</p>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Firma Adı</label>
              <input 
                className="input" 
                value={form.company_name} 
                onChange={e => setForm({...form, company_name: e.target.value})} 
                placeholder="Örn: Yıldız Mobilya"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Sektör</label>
                <select className="input" value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}>
                  <option value="dental">Diş Kliniği</option>
                  <option value="tailor">Terzi & Moda</option>
                  <option value="autoservice">Oto Servis</option>
                  <option value="furniture">Mobilya İmalat</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="input-label">Para Birimi</label>
                <select className="input" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>

        {/* Kullanıcı Profili (Read Only for now) */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Hesap Bilgileri</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Giriş yaptığınız hesap ve yetkiler.</p>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Kullanıcı Adı</label>
                <input className="input" value={user?.name || ''} disabled style={{ opacity: 0.7 }} />
              </div>
              <div>
                <label className="input-label">E-posta</label>
                <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>* E-posta ve şifre değişiklikleri güvenlik sebebiyle şu anlık kapalıdır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
