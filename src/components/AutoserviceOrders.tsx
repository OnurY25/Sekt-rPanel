'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Order, Customer } from '@/types';
import { Plus, CheckCircle, Clock, Edit2 } from 'lucide-react';

export default function AutoserviceOrders() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (tenant?.id) fetchData();
  }, [tenant?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from('orders').select('*, customer:customers(id, name, phone)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name, phone').order('name')
    ]);

    if (ordersRes.data) {
      setOrders(ordersRes.data as any);
      if (ordersRes.data.length > 0) setSelectedOrder(ordersRes.data[0] as any);
    }
    if (customersRes.data) setCustomers(customersRes.data as any);
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') return ['pending', 'in_progress', 'waiting_approval'].includes(o.status);
    if (statusFilter === 'completed') return ['ready', 'delivered'].includes(o.status);
    return true;
  });

  const getVehicleName = (order: Order) => {
    const marka = order.custom_data?.marka || '';
    const model = order.custom_data?.model || '';
    return `${marka} ${model}`.trim() || order.title;
  };

  const getPlaka = (order: Order) => {
    return order.custom_data?.plaka || 'Plaka Yok';
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f1f5f9', color: '#1e293b', overflow: 'hidden' }}>
      
      {/* Left List Column */}
      <div style={{ width: '340px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>İş Yönetimi</h2>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f8fafc', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setStatusFilter('all')}
              style={{ flex: 1, padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: statusFilter === 'all' ? '#2563eb' : 'transparent', color: statusFilter === 'all' ? '#fff' : '#64748b' }}
            >
              Tümü
            </button>
            <button 
              onClick={() => setStatusFilter('in_progress')}
              style={{ flex: 1, padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: statusFilter === 'in_progress' ? '#2563eb' : 'transparent', color: statusFilter === 'in_progress' ? '#fff' : '#64748b' }}
            >
              Devam Ediyor
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              style={{ flex: 1, padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: statusFilter === 'completed' ? '#2563eb' : 'transparent', color: statusFilter === 'completed' ? '#fff' : '#64748b' }}
            >
              Tamamlanan
            </button>
          </div>

          <button style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
            <Plus size={16} /> Yeni İş Oluştur
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map(order => {
              const isActive = selectedOrder?.id === order.id;
              const isCompleted = ['ready', 'delivered'].includes(order.status);
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  style={{ 
                    padding: '16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                    borderColor: isActive ? '#93c5fd' : '#e2e8f0', 
                    background: isActive ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCompleted ? '#dcfce7' : '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCompleted ? <CheckCircle size={16} color="#16a34a" /> : <Clock size={16} color="#ea580c" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{getVehicleName(order)}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{getPlaka(order)}</div>
                    </div>
                    <div style={{ color: '#cbd5e1' }}>›</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Details Column */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {selectedOrder ? (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ARAÇ KABUL FORMU</h1>
              <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <Edit2 size={16} /> Düzenle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Araç & Müşteri Bilgisi */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', marginBottom: '16px', textTransform: 'uppercase' }}>ARAÇ & MÜŞTERİ BİLGİSİ</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '12px', fontSize: '14px' }}>
                  <div style={{ color: '#64748b', fontWeight: '500' }}>ADI SOYADI:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.customer?.name}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>MARKA:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.custom_data?.marka || '-'}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>MODEL:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.custom_data?.model || '-'}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>PLAKA:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.custom_data?.plaka || '-'}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>TEL NO:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.customer?.phone || '-'}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>KİLOMETRE:</div>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.custom_data?.kilometre || '-'} km</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500' }}>GELİŞ TARİHİ:</div>
                  <div style={{ fontWeight: '600' }}>{new Date(selectedOrder.created_at).toLocaleDateString('tr-TR')}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center' }}>ÖDEME TİPİ:</div>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
                    <div style={{ padding: '4px 24px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>Nakit</div>
                    <div style={{ padding: '4px 24px', background: 'transparent', color: '#64748b', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>Kart</div>
                  </div>
                </div>
              </div>

              {/* Müşteriye Notlar */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit2 size={14} /> MÜŞTERİYE NOTLAR
                </h3>
                <textarea 
                  placeholder="Müşteriye iletilecek notlar..." 
                  defaultValue={selectedOrder.notes || ''}
                  style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '14px', color: '#475569' }}
                />
              </div>
            </div>

            {/* Müşteri İstekleri */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase' }}>MÜŞTERİ İSTEKLERİ</h3>
              <p style={{ marginTop: '8px', fontSize: '14px', color: '#475569' }}>{selectedOrder.custom_data?.sikayet || 'Belirtilmedi'}</p>
            </div>

            {/* Parça & İşçilik */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase' }}>PARÇA & İŞÇİLİK</h3>
            </div>

            {/* Toplam Tutar */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase', margin: 0 }}>TOPLAM TUTAR</h3>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>
                ₺{selectedOrder.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button style={{ width: '100%', padding: '20px', borderRadius: '16px', background: '#22c55e', color: 'white', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34,197,94,0.2)' }}>
              <CheckCircle size={20} /> İŞİ BİTİR VE TESLİM ET
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            Görüntülemek için sol taraftan bir iş seçin.
          </div>
        )}
      </div>
    </div>
  );
}
