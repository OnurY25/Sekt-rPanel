'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Workflow, Plus, X, ArrowRight, DollarSign, Phone, Mail, BarChart2, Loader2 } from 'lucide-react';
import { Customer } from '@/types';

const STAGES = [
  { id: 'lead', label: 'Potansiyel', color: '#8b9ab5' },
  { id: 'contacted', label: 'İletişim Kuruldu', color: '#3b82f6' },
  { id: 'proposal', label: 'Teklif Verildi', color: '#f59e0b' },
  { id: 'won', label: 'Kazanıldı', color: '#10b981' },
  { id: 'lost', label: 'Kaybedildi', color: '#ef4444' },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

export default function CRMPage() {
  const { tenant } = useStore();
  const supabase = createClient();
  const [leads, setLeads] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', estimated_value: '', stage: 'lead', source: 'Web' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [tenant?.id]);

  const fetchLeads = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setLeads(data as Customer[]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name || !tenant?.id) return;
    setSaving(true);
    
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        tenant_id: tenant.id,
        name: form.name,
        phone: form.phone,
        estimated_value: Number(form.estimated_value) || 0,
        stage: form.stage,
        source: form.source
      }])
      .select()
      .single();

    if (!error && data) {
      setLeads(prev => [data as Customer, ...prev]);
      setShowModal(false);
      setForm({ name: '', phone: '', estimated_value: '', stage: 'lead', source: 'Web' });
    } else {
      console.error('Lead eklenirken hata:', error);
    }
    setSaving(false);
  };

  const moveStage = async (id: string, stage: string) => {
    const { error } = await supabase
      .from('customers')
      .update({ stage })
      .eq('id', id);

    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    }
  };

  const totalValue = leads.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.estimated_value || 0), 0);
  const conversionRate = leads.length > 0 
    ? Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Müşteri verileri yükleniyor...</p>
      </div>
    );
  }

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', overflowX: 'auto', paddingBottom: '20px' }}>
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          return (
            <div key={stage.id} style={{ minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '0 4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{stage.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '600', color: stage.color, background: `${stage.color}20`, padding: '1px 6px', borderRadius: '8px' }}>
                  {stageLeads.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '4px' }}>
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="card" style={{ padding: '12px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{lead.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={9} /> {lead.phone}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>{formatCurrency(lead.estimated_value || 0)}</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {STAGES.filter((s) => s.id !== stage.id).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => moveStage(lead.id, s.id)}
                          style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: `${s.color}15`, color: s.color, border: 'none', cursor: 'pointer', fontWeight: '600' }}
                        >
                          → {s.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                    Boş
                  </div>
                )}
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
                  <input className="input" type="number" placeholder="0" value={form.estimated_value} onChange={(e) => setForm((p) => ({ ...p, estimated_value: e.target.value }))} />
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
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
