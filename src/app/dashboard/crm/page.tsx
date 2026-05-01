'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Workflow, Plus, X, ArrowRight, DollarSign, Phone, Mail, BarChart2 } from 'lucide-react';

const STAGES = [
  { id: 'lead', label: 'Potansiyel', color: '#8b9ab5', count: 8 },
  { id: 'contacted', label: 'İletişim Kuruldu', color: '#3b82f6', count: 5 },
  { id: 'proposal', label: 'Teklif Verildi', color: '#f59e0b', count: 3 },
  { id: 'won', label: 'Kazanıldı', color: '#10b981', count: 4 },
  { id: 'lost', label: 'Kaybedildi', color: '#ef4444', count: 2 },
];

const MOCK_LEADS = [
  { id: 'l1', name: 'Berk Aydın', phone: '0533 100 2200', value: 4500, stage: 'proposal', source: 'Instagram', date: '2024-05-20' },
  { id: 'l2', name: 'Deniz Kara', phone: '0541 200 3300', value: 2800, stage: 'contacted', source: 'Referans', date: '2024-05-22' },
  { id: 'l3', name: 'Ece Mart', phone: '0555 300 4400', value: 6200, stage: 'lead', source: 'Web', date: '2024-05-25' },
  { id: 'l4', name: 'Fırat Su', phone: '0546 400 5500', value: 1900, stage: 'won', source: 'Telefon', date: '2024-05-18' },
  { id: 'l5', name: 'Gizem Tok', phone: '0538 500 6600', value: 3100, stage: 'lead', source: 'Instagram', date: '2024-05-27' },
  { id: 'l6', name: 'Hakan Uz', phone: '0539 600 7700', value: 5500, stage: 'proposal', source: 'Referans', date: '2024-05-26' },
  { id: 'l7', name: 'Iraz Can', phone: '0542 700 8800', value: 2200, stage: 'contacted', source: 'Web', date: '2024-05-24' },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

export default function CRMPage() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', value: '', stage: 'lead', source: 'Web' });

  const handleSave = () => {
    if (!form.name) return;
    setLeads((prev) => [{ id: `l${Date.now()}`, ...form, value: Number(form.value), date: new Date().toISOString().split('T')[0] }, ...prev]);
    setShowModal(false);
    setForm({ name: '', phone: '', value: '', stage: 'lead', source: 'Web' });
  };

  const moveStage = (id: string, stage: string) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage } : l));
  };

  const totalValue = leads.reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter((l) => l.stage === 'won').reduce((s, l) => s + l.value, 0);
  const conversionRate = Math.round((leads.filter((l) => l.stage === 'won').length / leads.length) * 100);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">CRM Satış Pipeline</h1>
            <p className="page-subtitle">Potansiyel müşterilerden kazanıma</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Lead Ekle
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Toplam Lead', value: leads.length, color: '#6366f1' },
          { label: 'Pipeline Değeri', value: formatCurrency(totalValue), color: '#f59e0b' },
          { label: 'Kazanılan', value: formatCurrency(wonValue), color: '#10b981' },
          { label: 'Dönüşüm Oranı', value: `%${conversionRate}`, color: '#3b82f6' },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>{kpi.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Kanban Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', overflowX: 'auto' }}>
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          return (
            <div key={stage.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '0 4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{stage.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '600', color: stage.color, background: `${stage.color}20`, padding: '1px 6px', borderRadius: '8px' }}>
                  {stageLeads.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px' }}>
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="card" style={{ padding: '12px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{lead.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={9} /> {lead.phone}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>{formatCurrency(lead.value)}</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {STAGES.filter((s) => s.id !== stage.id).slice(0, 2).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => moveStage(lead.id, s.id)}
                          style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: `${s.color}15`, color: s.color, border: 'none', cursor: 'pointer', fontWeight: '600' }}
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Yeni Lead Ekle</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Ad Soyad</label>
                <input className="input" placeholder="Potansiyel müşteri" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Telefon</label>
                <input className="input" placeholder="0532 000 0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Tahmini Değer (₺)</label>
                  <input className="input" type="number" placeholder="0" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Kaynak</label>
                  <select className="input" value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}>
                    {['Web', 'Instagram', 'Referans', 'Telefon', 'Diğer'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
