'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, X, MessageSquare, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const MOCK_TICKETS = [
  { id: 't1', title: 'Fatura indirme çalışmıyor', status: 'open', priority: 'high', created: '2024-05-28', messages: 3 },
  { id: 't2', title: 'Randevu bildirimi gelmedi', status: 'in_progress', priority: 'medium', created: '2024-05-26', messages: 7 },
  { id: 't3', title: 'Rapor sayfası yavaş açılıyor', status: 'resolved', priority: 'low', created: '2024-05-20', messages: 5 },
  { id: 't4', title: 'SMS bildirimleri nasıl aktif edilir?', status: 'resolved', priority: 'low', created: '2024-05-15', messages: 2 },
];

const STATUS_CONFIG = {
  open: { label: 'Açık', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  in_progress: { label: 'İşlemde', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  resolved: { label: 'Çözüldü', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const PRIORITY_CONFIG = {
  high: { label: 'Yüksek', color: '#ef4444' },
  medium: { label: 'Orta', color: '#f59e0b' },
  low: { label: 'Düşük', color: '#8b9ab5' },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });

  const handleSubmit = () => {
    if (!form.title) return;
    setTickets((prev) => [{
      id: `t${Date.now()}`, title: form.title, status: 'open',
      priority: form.priority, created: new Date().toISOString().split('T')[0], messages: 0,
    }, ...prev]);
    setShowModal(false);
    setForm({ title: '', description: '', priority: 'medium' });
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Destek Talepleri</h1>
            <p className="page-subtitle">Teknik destek ve yardım talepleri</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Yeni Talep
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Açık Talepler', value: tickets.filter((t) => t.status === 'open').length, color: '#ef4444', icon: <AlertCircle size={18} /> },
          { label: 'Devam Eden', value: tickets.filter((t) => t.status === 'in_progress').length, color: '#3b82f6', icon: <Clock size={18} /> },
          { label: 'Çözülen', value: tickets.filter((t) => t.status === 'resolved').length, color: '#10b981', icon: <CheckCircle size={18} /> },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: s.color }}>
              {s.icon}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickets.map((ticket) => {
          const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG];
          const priority = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
          return (
            <div key={ticket.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '8px', height: '40px', borderRadius: '4px', background: status.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{ticket.title}</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: status.color, background: status.bg, padding: '2px 8px', borderRadius: '10px' }}>
                    {status.label}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: priority.color }}>
                    {priority.label} Öncelik
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span><Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />{ticket.created}</span>
                  <span><MessageSquare size={10} style={{ display: 'inline', marginRight: '3px' }} />{ticket.messages} mesaj</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Yeni Destek Talebi</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Konu *</label>
                <input className="input" placeholder="Sorunuzu kısaca açıklayın" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Öncelik</label>
                <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
              <div>
                <label className="input-label">Açıklama</label>
                <textarea className="input" placeholder="Sorunu detaylıca açıklayın..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ minHeight: '100px' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Talebi Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
