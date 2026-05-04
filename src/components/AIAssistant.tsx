'use client';

import { useState } from 'react';
import { Sparkles, X, MessageSquare, FileText, Send, Bot } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'generate'>('chat');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'Merhaba! Ben SektörAI. İşletmenizle ilgili rapor hazırlayabilir, müşteri mesajları oluşturabilir veya verilerinizi analiz edebilirim. Size nasıl yardımcı olabilirim?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { tenant } = useStore();
  const supabase = createClient();

  const fetchContextData = async () => {
    if (!tenant) return {};
    
    const [custRes, orderRes, payRes, apptRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, status'),
      supabase.from('payments').select('amount, paid_at'),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('date', new Date().toISOString().split('T')[0])
    ]);

    const pendingOrders = (orderRes.data || []).filter(o => ['pending', 'in_progress'].includes(o.status)).length;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = (payRes.data || [])
      .filter(p => new Date(p.paid_at) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      customersCount: custRes.count || 0,
      pendingOrdersCount: pendingOrders,
      monthlyRevenue,
      todayApptsCount: apptRes.count || 0
    };
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userText = query;
    const newMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMessages);
    setQuery('');
    setIsTyping(true);

    try {
      const contextData = await fetchContextData();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          tenant,
          contextData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Hata: ${data.error || 'Bilinmeyen bir sorun oluştu.'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bağlantı hatası oluştu. Lütfen internetinizi kontrol edin.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px', borderRadius: '28px',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          cursor: 'pointer', border: 'none', zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      width: '380px', height: '600px', maxHeight: '80vh',
      background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '20px', display: 'flex', flexDirection: 'column',
      boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      zIndex: 1000, overflow: 'hidden', animation: 'slideUp 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
        borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>SektörAI Katmanı</div>
            <div style={{ fontSize: '12px', color: '#818cf8', fontWeight: '500' }}>Claude 4.6 Sonnet Destekli Asistan</div>

          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 20px', borderBottom: '1px solid var(--border)', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('chat')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === 'chat' ? 'rgba(99,102,241,0.1)' : 'transparent',
            color: activeTab === 'chat' ? '#818cf8' : 'var(--text-secondary)'
          }}
        >
          <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} /> Sohbet
        </button>
        <button 
          onClick={() => setActiveTab('generate')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === 'generate' ? 'rgba(99,102,241,0.1)' : 'transparent',
            color: activeTab === 'generate' ? '#818cf8' : 'var(--text-secondary)'
          }}
        >
          <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} /> Üretim
        </button>
      </div>

      {/* Content - Chat */}
      {activeTab === 'chat' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                )}
                <div style={{
                  padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.5,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.03)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', maxWidth: '85%' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Bot size={16} />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }} />
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <div style={{ position: 'relative' }}>
              <input 
                className="input" 
                placeholder="İşletmenizle ilgili bir soru sorun..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ paddingRight: '40px', borderRadius: '20px' }}
              />
              <button 
                onClick={handleSend}
                disabled={!query.trim() || isTyping}
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  width: '28px', height: '28px', borderRadius: '14px', border: 'none',
                  background: query.trim() ? '#6366f1' : 'transparent', 
                  color: query.trim() ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: query.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={14} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Content - Generate */}
      {activeTab === 'generate' && (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Yapay zeka ile saniyeler içinde içerik üretin.</p>
          
          {[
            { title: 'Teklif Oluştur', desc: 'Müşteriye özel profesyonel fiyat teklifi', icon: '📄', prompt: 'Müşteriye standart bir hizmet için fiyat teklifi metni oluştur.' },
            { title: 'Mesaj Taslağı', desc: 'WhatsApp için otomatik yanıt taslağı', icon: '💬', prompt: 'Müşteriye siparişinin hazır olduğunu bildiren kısa, profesyonel bir WhatsApp mesajı yaz.' },
            { title: 'Haftalık Rapor', desc: 'Satış ve performans özeti', icon: '📊', prompt: 'Son haftanın performansını özetleyen yöneticiye sunulacak kısa bir metin hazırla.' },
            { title: 'Tahsilat Hatırlatıcı', desc: 'Kibar ödeme hatırlatma mesajı', icon: '💳', prompt: 'Ödemesi geciken bir müşteriye gönderilecek çok kibar ve anlayışlı bir tahsilat hatırlatma mesajı yaz.' },
          ].map((item, i) => (
            <button key={i} 
            onClick={() => {
              setActiveTab('chat');
              setQuery(item.prompt);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ fontSize: '24px' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
