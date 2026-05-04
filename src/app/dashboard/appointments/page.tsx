'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Appointment, AppointmentStatus, Customer } from '@/types';
import { Calendar, Clock, Plus, X, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
  no_show: 'Gelmedi',
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  no_show: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function AppointmentsPage() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ customer_id: '', date: '', time: '', service: '', notes: '', status: 'scheduled' as AppointmentStatus });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [apptsRes, custsRes] = await Promise.all([
      supabase.from('appointments').select('*, customer:customers(id, name)').order('date').order('time'),
      supabase.from('customers').select('id, name').order('name')
    ]);

    if (apptsRes.data) setAppointments(apptsRes.data as any);
    if (custsRes.data) setCustomers(custsRes.data as any);
    setLoading(false);
  };

  if (!tenant) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const upcomingAppts = appointments.filter((a) => a.date > today && a.status === 'scheduled');

  const handleSave = async () => {
    if (!form.customer_id || !form.date || !tenant?.id) return;
    setSaving(true);

    const apptData = {
      tenant_id: tenant.id,
      customer_id: form.customer_id,
      date: form.date,
      time: form.time,
      service: form.service,
      notes: form.notes,
      status: form.status
    };

    const { data: newAppt, error } = await supabase
      .from('appointments')
      .insert([apptData])
      .select('*, customer:customers(id, name)')
      .single();

    if (!error && newAppt) {
      setAppointments(prev => [...prev, newAppt as any].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
      addNotification({ title: 'Randevu Oluşturuldu', message: `Yeni randevu başarıyla kaydedildi.`, type: 'success' });
      setShowModal(false);
      setForm({ customer_id: '', date: '', time: '', service: '', notes: '', status: 'scheduled' });
    }

    setSaving(false);
  };

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      addNotification({ title: 'Durum Güncellendi', message: `Randevu durumu "${STATUS_LABELS[status]}" olarak güncellendi.`, type: 'info' });
    }
  };

  const TimeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

  const selectedDateAppts = appointments.filter((a) => a.date === selectedDate);

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Randevular senkronize ediliyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Randevu Yönetimi</h1>
            <p className="page-subtitle">Bugün {todayAppts.length} randevu · {upcomingAppts.length} yaklaşan</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Yeni Randevu
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Calendar Panel */}
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Tarih Seç</h3>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Genel Durum</h3>
            {[
              { label: 'Planlandı', count: appointments.filter((a) => a.status === 'scheduled').length, color: '#3b82f6' },
              { label: 'Tamamlandı', count: appointments.filter((a) => a.status === 'completed').length, color: '#10b981' },
              { label: 'İptal', count: appointments.filter((a) => a.status === 'cancelled').length, color: '#ef4444' },
              { label: 'Gelmedi', count: appointments.filter((a) => a.status === 'no_show').length, color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <span style={{ fontWeight: '700', color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day View */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
            {new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {selectedDateAppts.length} randevu
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TimeSlots.map((slot) => {
              const appt = selectedDateAppts.find((a) => a.time === slot);
              return (
                <div key={slot} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', paddingTop: '8px', flexShrink: 0 }}>
                    {slot}
                  </div>
                  <div style={{ flex: 1, minHeight: '36px' }}>
                    {appt ? (
                      <div style={{
                        padding: '8px 12px', borderRadius: '8px',
                        background: appt.status === 'completed' ? 'rgba(16,185,129,0.1)' :
                          appt.status === 'cancelled' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.1)',
                        border: `1px solid ${appt.status === 'completed' ? 'rgba(16,185,129,0.2)' :
                          appt.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.2)'}`,
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{appt.customer?.name}</div>
                          {appt.service && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{appt.service}</div>}
                        </div>
                        <span className={`badge ${STATUS_STYLES[appt.status]}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {STATUS_LABELS[appt.status]}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => changeStatus(appt.id, 'completed')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '2px' }} title="Tamamlandı">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => changeStatus(appt.id, 'cancelled')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }} title="İptal Et">
                            <XCircle size={14} />
                          </button>
                          <button onClick={() => changeStatus(appt.id, 'no_show')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '2px' }} title="Gelmedi">
                            <AlertCircle size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '36px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Yeni Randevu</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Müşteri *</label>
                <select className="input" value={form.customer_id} onChange={(e) => setForm((p) => ({ ...p, customer_id: e.target.value }))}>
                  <option value="">Müşteri seçin...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Tarih *</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Saat</label>
                  <select className="input" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}>
                    <option value="">Saat seçin...</option>
                    {TimeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Hizmet / Konu</label>
                <input className="input" placeholder="Örn: İlk Prova, Tedavi, Servis..." value={form.service} onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Notlar</label>
                <textarea className="input" placeholder="Ek bilgiler..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Randevu Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
