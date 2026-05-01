'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Shield, Plus, X, Edit2, Check, Crown, Eye } from 'lucide-react';

const ROLE_CONFIG = {
  owner: { label: 'Sahip', color: '#f59e0b', desc: 'Tüm erişim, fatura yönetimi' },
  manager: { label: 'Yönetici', color: '#6366f1', desc: 'Raporlar ve kullanıcı yönetimi hariç tam erişim' },
  staff: { label: 'Personel', color: '#10b981', desc: 'Müşteri ve sipariş işlemleri' },
  viewer: { label: 'Görüntüleyici', color: '#8b9ab5', desc: 'Sadece okuma erişimi' },
};

const PERMISSIONS = [
  { key: 'customers', label: 'Müşteri Yönetimi' },
  { key: 'orders', label: 'Sipariş Yönetimi' },
  { key: 'payments', label: 'Ödeme Görüntüleme' },
  { key: 'payments_edit', label: 'Ödeme Düzenleme' },
  { key: 'appointments', label: 'Randevu Yönetimi' },
  { key: 'tasks', label: 'Görev Yönetimi' },
  { key: 'analytics', label: 'Analitik & Raporlar' },
  { key: 'settings', label: 'Sistem Ayarları' },
  { key: 'team', label: 'Ekip Yönetimi' },
  { key: 'subscription', label: 'Abonelik Yönetimi' },
];

const PERMISSION_MATRIX: Record<string, string[]> = {
  owner: PERMISSIONS.map((p) => p.key),
  manager: ['customers', 'orders', 'payments', 'appointments', 'tasks', 'analytics'],
  staff: ['customers', 'orders', 'appointments', 'tasks'],
  viewer: ['customers', 'orders'],
};

const MOCK_TEAM = [
  { id: 'm1', name: 'Onur Yıldız', email: 'onur@firma.com', role: 'owner' as const, status: 'active', joined: '2024-01-01' },
  { id: 'm2', name: 'Murat Usta', email: 'murat@firma.com', role: 'staff' as const, status: 'active', joined: '2024-02-15' },
  { id: 'm3', name: 'Selin Kaya', email: 'selin@firma.com', role: 'manager' as const, status: 'active', joined: '2024-03-10' },
  { id: 'm4', name: 'Ahmet Demir', email: 'ahmet@firma.com', role: 'viewer' as const, status: 'pending', joined: '2024-05-01' },
];

type Role = keyof typeof ROLE_CONFIG;

export default function TeamPage() {
  const [team, setTeam] = useState(MOCK_TEAM);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'permissions'>('members');
  const [form, setForm] = useState({ name: '', email: '', role: 'staff' as Role });

  const handleInvite = () => {
    if (!form.name || !form.email) return;
    const newMember = { id: `m${Date.now()}`, ...form, status: 'pending', joined: new Date().toISOString().split('T')[0] };
    setTeam((prev) => [...prev, newMember]);
    setShowModal(false);
    setForm({ name: '', email: '', role: 'staff' });
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Ekip & Yetkiler</h1>
            <p className="page-subtitle">{team.length} ekip üyesi · Rol bazlı erişim kontrolü</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Üye Davet Et
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '24px', width: 'fit-content' }}>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Ekip Üyeleri</button>
        <button className={`tab ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>Yetki Matrisi</button>
      </div>

      {activeTab === 'members' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Üye</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Katılım</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => {
                  const role = ROLE_CONFIG[member.role];
                  return (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '36px', height: '36px' }}>{member.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{member.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: role.color, background: `${role.color}15`, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${role.color}30` }}>
                          {role.label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${member.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                          {member.status === 'active' ? 'Aktif' : 'Davet Bekleniyor'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.joined}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm">Rol Değiştir</button>
                          {member.role !== 'owner' && (
                            <button className="btn btn-danger btn-sm">Çıkar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Her rolün hangi modüllere erişebildiğini gösterir. Yeşil = Erişim var, Gri = Erişim yok.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Yetki</th>
                  {Object.entries(ROLE_CONFIG).map(([key, r]) => (
                    <th key={key} style={{ textAlign: 'center', color: r.color }}>{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.key}>
                    <td style={{ fontWeight: '500', fontSize: '13px' }}>{perm.label}</td>
                    {Object.keys(ROLE_CONFIG).map((role) => (
                      <td key={role} style={{ textAlign: 'center' }}>
                        {PERMISSION_MATRIX[role].includes(perm.key) ? (
                          <Check size={16} style={{ color: '#10b981', margin: '0 auto' }} />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Descriptions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '24px' }}>
            {Object.entries(ROLE_CONFIG).map(([key, r]) => (
              <div key={key} style={{ padding: '14px', borderRadius: '10px', background: `${r.color}08`, border: `1px solid ${r.color}20` }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: r.color, marginBottom: '4px' }}>{r.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Üye Davet Et</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Ad Soyad</label>
                <input className="input" placeholder="Örn: Murat Usta" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">E-posta</label>
                <input className="input" type="email" placeholder="ornek@mail.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Rol</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'owner').map(([key, r]) => (
                    <button
                      key={key}
                      onClick={() => setForm((p) => ({ ...p, role: key as Role }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                        background: form.role === key ? `${r.color}15` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.role === key ? r.color : 'var(--border)'}`,
                        color: form.role === key ? r.color : 'var(--text-secondary)',
                      }}
                    >
                      <Shield size={14} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{r.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.desc}</div>
                      </div>
                      {form.role === key && <Check size={14} style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleInvite}>Davet Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
