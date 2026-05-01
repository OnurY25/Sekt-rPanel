'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getSectorConfig } from '@/lib/sectors';
import { Settings, Save, Globe, Palette, Bell, Database, Shield, Download } from 'lucide-react';

export default function SettingsPage() {
  const { tenant, user } = useStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  if (!tenant || !user) return null;
  const config = getSectorConfig(tenant.sector);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: 'general', label: 'Genel', icon: <Settings size={15} /> },
    { id: 'appearance', label: 'Görünüm', icon: <Palette size={15} /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Bell size={15} /> },
    { id: 'data', label: 'Veri & Güvenlik', icon: <Database size={15} /> },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sistem Ayarları</h1>
        <p className="page-subtitle">{tenant.company_name} · {config.label}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Sidebar Tabs */}
        <div className="card" style={{ padding: '8px', height: 'fit-content' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'none',
                color: activeTab === tab.id ? '#818cf8' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'general' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Firma Bilgileri</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Firma Adı', value: tenant.company_name, placeholder: 'Firma adı' },
                  { label: 'Sektör', value: config.label, placeholder: '', disabled: true },
                  { label: 'Telefon', value: '0532 000 0000', placeholder: '' },
                  { label: 'E-posta', value: user.email, placeholder: '' },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="input-label">{f.label}</label>
                    <input className="input" defaultValue={f.value} placeholder={f.placeholder} disabled={f.disabled} style={f.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label className="input-label">Para Birimi</label>
                  <select className="input" defaultValue={tenant.currency}>
                    <option value="TRY">₺ Türk Lirası (TRY)</option>
                    <option value="USD">$ Amerikan Doları (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Dil</label>
                  <select className="input" defaultValue="tr">
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Adres</label>
                <textarea className="input" placeholder="İşletme adresi..." />
              </div>
              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? '✓ Kaydedildi' : <><Save size={14} /> Kaydet</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Görünüm Ayarları</h3>
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Tema Rengi</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '8px' }}>
                  {['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'].map((color) => (
                    <div key={color} style={{
                      width: '100%', paddingBottom: '100%', borderRadius: '10px', background: color,
                      cursor: 'pointer', position: 'relative', boxShadow: `0 4px 12px ${color}40`,
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Sidebar Stili</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Koyu (Mevcut)', active: true },
                    { label: 'Çok Koyu', active: false },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${s.active ? '#6366f1' : 'var(--border)'}`, background: s.active ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', fontSize: '13px', color: s.active ? '#818cf8' : 'var(--text-secondary)', fontWeight: '500' }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSave}>
                {saved ? '✓ Kaydedildi' : <><Save size={14} /> Kaydet</>}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Bildirim Tercihleri</h3>
              {[
                { label: 'Yeni sipariş bildirimi', desc: 'Sipariş oluşturulduğunda bildir' },
                { label: 'Randevu hatırlatması', desc: 'Randevudan 1 saat önce hatırlat' },
                { label: 'Ödeme bildirimi', desc: 'Ödeme alındığında bildir' },
                { label: 'Gecikmiş sipariş uyarısı', desc: 'Teslim tarihi geçen siparişler' },
                { label: 'Görev hatırlatması', desc: 'Bitiş tarihi yaklaşan görevler' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <div style={{
                    width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', position: 'relative',
                  }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Veri & Güvenlik</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Veriyi Excel Olarak Dışa Aktar', desc: 'Tüm müşteri ve sipariş verilerini indirin', icon: <Download size={16} />, color: '#10b981' },
                  { label: 'JSON Formatında İndir', desc: 'Ham veri dışa aktarımı', icon: <Download size={16} />, color: '#3b82f6' },
                  { label: 'Yedek Oluştur', desc: 'Anlık veritabanı yedeği', icon: <Database size={16} />, color: '#6366f1' },
                ].map((action, i) => (
                  <button key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', background: `${action.color}10`, border: `1px solid ${action.color}20`, cursor: 'pointer', textAlign: 'left', color: action.color }}>
                    {action.icon}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{action.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={16} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>Tehlikeli Bölge</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Bu işlemler geri alınamaz. Dikkatli olun.</p>
                <button className="btn btn-danger btn-sm">Hesabı Sil</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
