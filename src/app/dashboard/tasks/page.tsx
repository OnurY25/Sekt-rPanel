'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Task, TaskStatus } from '@/types';
import { Plus, X, CheckSquare, Circle, AlertCircle, Clock, User, Loader2 } from 'lucide-react';

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'Yapılacak', color: '#f59e0b' },
  { key: 'in_progress', label: 'Devam Ediyor', color: '#3b82f6' },
  { key: 'done', label: 'Tamamlandı', color: '#10b981' },
];

const PRIORITY_CONFIG = {
  high: { label: 'Yüksek', color: '#ef4444' },
  medium: { label: 'Orta', color: '#f59e0b' },
  low: { label: 'Düşük', color: '#8b9ab5' },
};

export default function TasksPage() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', assigned_to: '', status: 'todo' as TaskStatus, priority: 'medium' as 'high' | 'medium' | 'low', due_date: '' });
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchTasks();
    }
  }, [tenant?.id]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !tenant?.id) return;
    setSaving(true);

    const taskData = {
      tenant_id: tenant.id,
      title: form.title,
      assigned_to: form.assigned_to,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null
    };

    const { data: newTask, error } = await supabase.from('tasks').insert([taskData]).select().single();

    if (!error && newTask) {
      setTasks(prev => [newTask as Task, ...prev]);
      addNotification({ title: 'Görev Eklendi', message: `"${form.title}" görevi oluşturuldu.`, type: 'success' });
      setShowModal(false);
      setForm({ title: '', assigned_to: '', status: 'todo', priority: 'medium', due_date: '' });
    }
    setSaving(false);
  };

  const moveTask = async (id: string, status: TaskStatus) => {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
      addNotification({ title: 'Görev Silindi', message: 'Görev başarıyla kaldırıldı.', type: 'info' });
    }
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Görevler yükleniyor...</p>
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const priority = PRIORITY_CONFIG[task.priority || 'medium'];
    return (
      <div className="card" style={{ padding: '14px', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <button
            onClick={() => moveTask(task.id, task.status === 'done' ? 'todo' : 'done')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'done' ? '#10b981' : 'var(--text-muted)', marginTop: '1px', flexShrink: 0 }}
          >
            {task.status === 'done' ? <CheckSquare size={16} /> : <Circle size={16} />}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: 1.4 }}>
              {task.title}
            </div>
          </div>
          <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.5 }}>
            <X size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '26px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: priority.color, background: `${priority.color}15`, padding: '2px 6px', borderRadius: '4px' }}>
            {priority.label}
          </span>
          {task.due_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Clock size={10} /> {new Date(task.due_date).toLocaleDateString('tr-TR')}
            </div>
          )}
          {task.assigned_to && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <User size={10} /> {task.assigned_to}
            </div>
          )}
        </div>
        <div style={{ paddingLeft: '26px', marginTop: '12px', display: 'flex', gap: '4px' }}>
          {STATUS_COLUMNS.filter((c) => c.key !== task.status).map((col) => (
            <button key={col.key} onClick={() => moveTask(task.id, col.key)} className="btn btn-secondary btn-sm" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px' }}>
              → {col.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Görev Yönetimi</h1>
            <p className="page-subtitle">{tasks.filter((t) => t.status !== 'done').length} aktif görev</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="tabs" style={{ marginRight: '8px' }}>
              <button className={`tab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>Kanban</button>
              <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Liste</button>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Yeni Görev
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Bekleyen', value: tasks.filter((t) => t.status === 'todo').length, color: '#f59e0b' },
          { label: 'Devam Eden', value: tasks.filter((t) => t.status === 'in_progress').length, color: '#3b82f6' },
          { label: 'Tamamlanan', value: tasks.filter((t) => t.status === 'done').length, color: '#10b981' },
          { label: 'Geciken', value: tasks.filter((t) => t.due_date && t.due_date < new Date().toISOString().split('T')[0] && t.status !== 'done').length, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{col.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: col.color, background: `${col.color}20`, padding: '2px 8px', borderRadius: '10px' }}>
                    {colTasks.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px' }}>
                  {colTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                  {colTasks.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                      Görev yok
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Görev</th>
                  <th>Öncelik</th>
                  <th>Atanan</th>
                  <th>Bitiş</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
                  return (
                    <tr key={task.id}>
                      <td style={{ fontWeight: '500' }}>{task.title}</td>
                      <td><span style={{ fontSize: '12px', fontWeight: '600', color: priority.color }}>{priority.label}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{task.assigned_to || '—'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : '—'}</td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-danger btn-sm btn-icon"
                        >
                          <X size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Yeni Görev</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Görev Başlığı *</label>
                <input className="input" placeholder="Ne yapılacak?" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Öncelik</label>
                  <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as any }))}>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Durum</label>
                  <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}>
                    {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Atanan Kişi</label>
                <input className="input" placeholder="Kim yapacak?" value={form.assigned_to} onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Bitiş Tarihi</label>
                <input className="input" type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
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
