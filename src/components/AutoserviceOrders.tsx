'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Order, Customer } from '@/types';
import { Plus, CheckCircle, Clock, Edit2, Printer, Settings } from 'lucide-react';

export default function AutoserviceOrders() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (tenant?.id) fetchData();
    const storedPhone = localStorage.getItem('auto_phone');
    const storedEmail = localStorage.getItem('auto_email');
    if (storedPhone) setContactPhone(storedPhone);
    if (storedEmail) setContactEmail(storedEmail);
  }, [tenant?.id]);

  const saveSettings = () => {
    localStorage.setItem('auto_phone', contactPhone);
    localStorage.setItem('auto_email', contactEmail);
    setShowSettings(false);
    addNotification({ title: 'Başarılı', message: 'İletişim bilgileri kaydedildi.', type: 'success' });
  };

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
      <div className="no-print" style={{ width: '340px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>İş Yönetimi</h2>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <Settings size={18} />
            </button>
          </div>
          
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
      <div className="no-print" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {selectedOrder ? (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ARAÇ KABUL FORMU</h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => window.print()} style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Printer size={16} /> Çıktı Al
                </button>
                <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <Edit2 size={16} /> Düzenle
                </button>
              </div>
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

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Firma Bilgilerini Ayarla</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Bu bilgiler PDF çıktısında sağ üst köşede görünecektir.</p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>İletişim Telefonu</label>
              <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Örn: 552-245-6598" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>İletişim E-posta</label>
              <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Örn: info@firma.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSettings(false)} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>İptal</button>
              <button onClick={saveSettings} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT ONLY VIEW */}
      <div className="print-only">
        {selectedOrder && (
          <div style={{ width: '100%', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', color: '#fff', padding: '12px 24px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontStyle: 'italic' }}>
                {tenant?.company_name || 'ÖZEL SERVİS'}
              </div>
              <div style={{ textAlign: 'right', fontSize: '14px', fontStyle: 'italic' }}>
                <div>İletişim: {contactPhone || '-'}</div>
                <div>{contactEmail || '-'}</div>
              </div>
            </div>
            
            <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #333' }}>
              ARAÇ KABUL FORMU
            </div>

            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000' }}>
              <tbody>
                <tr className="bg-gray">
                  <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>ARAÇ & MÜŞTERİ BİLGİSİ</td>
                  <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>GELİŞ TARİHİ</td>
                  <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>TESLİM TARİHİ</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', width: '15%' }}>ADI SOYADI</td>
                  <td style={{ width: '35%' }}>{selectedOrder.customer?.name}</td>
                  <td colSpan={2} rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>{new Date(selectedOrder.created_at).toLocaleDateString('tr-TR')}</td>
                  <td colSpan={2} rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>-</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>MARKA</td>
                  <td>{selectedOrder.custom_data?.marka}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>MODEL</td>
                  <td>{selectedOrder.custom_data?.model}</td>
                  <td colSpan={2} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>YAKIT</td>
                  <td colSpan={2} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>KİLOMETRE</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>PLAKA</td>
                  <td>{selectedOrder.custom_data?.plaka}</td>
                  <td colSpan={2} rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>{selectedOrder.custom_data?.yakit || '-'}</td>
                  <td colSpan={2} rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>{selectedOrder.custom_data?.kilometre || '-'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>TEL NO</td>
                  <td>{selectedOrder.customer?.phone}</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ borderRight: 'none' }}></td>
                  <td colSpan={2} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #000' }}>ÖDEME TİPİ</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ borderRight: 'none' }}></td>
                  <td colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid #000' }}>NAKİT / KART</td>
                </tr>
                
                {/* İstekler */}
                <tr><td colSpan={6} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>MÜŞTERİ İSTEKLERİ</td></tr>
                <tr><td colSpan={3}>1 - {selectedOrder.custom_data?.sikayet || ''}</td><td colSpan={3}>4 -</td></tr>
                <tr><td colSpan={3}>2 -</td><td colSpan={3}>5 -</td></tr>
                <tr><td colSpan={3}>3 -</td><td colSpan={3}>6 -</td></tr>

                {/* Parça ve İşçilik */}
                <tr><td colSpan={6} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>FİYAT LİSTESİ</td></tr>
                <tr><td colSpan={4} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>PARÇA & İŞÇİLİK</td><td colSpan={2} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>FİYAT</td></tr>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4}>{i + 1} - </td>
                    <td colSpan={2}></td>
                  </tr>
                ))}
                
                <tr>
                  <td colSpan={3} style={{ borderRight: 'none' }}></td>
                  <td className="bg-orange" style={{ textAlign: 'right', fontWeight: 'bold', borderLeft: '1px solid #000' }}>TOPLAM</td>
                  <td colSpan={2} className="bg-orange" style={{ textAlign: 'right', fontWeight: 'bold' }}>₺{selectedOrder.price.toLocaleString('tr-TR')}</td>
                </tr>

                {/* Footer */}
                <tr>
                  <td colSpan={3} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>ONAY</td>
                  <td colSpan={3} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>MÜŞTERİYE İLETİLECEK NOTLAR</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold' }}>İLGİLİ USTA</td>
                  <td colSpan={3}>1 - {selectedOrder.notes || ''}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="bg-gray" style={{ textAlign: 'center', fontWeight: 'bold' }}>-</td>
                  <td colSpan={3}>2 -</td>
                </tr>
                <tr>
                  <td colSpan={3} className="bg-gray"></td>
                  <td colSpan={3}>3 -</td>
                </tr>
                <tr>
                  <td colSpan={3} className="bg-gray"></td>
                  <td colSpan={3}>4 -</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
