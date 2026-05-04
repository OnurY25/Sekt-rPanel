'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, FileText, Trash2, Download, Loader2, Image as ImageIcon } from 'lucide-react';

export default function FilesPage() {
  const { tenant, addNotification } = useStore();
  const supabase = createClient();
  
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchFiles();
    }
  }, [tenant?.id]);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .storage
      .from('documents')
      .list(tenant?.id + '/', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (data) {
      setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !tenant?.id) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${tenant.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      addNotification({ title: 'Hata', message: 'Dosya yüklenirken bir sorun oluştu.', type: 'error' });
    } else {
      addNotification({ title: 'Başarılı', message: 'Dosya sisteme yüklendi.', type: 'success' });
      fetchFiles();
    }
    
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    if (!tenant?.id) return;
    const { error } = await supabase.storage
      .from('documents')
      .remove([`${tenant.id}/${fileName}`]);

    if (!error) {
      setFiles(files.filter(f => f.name !== fileName));
      addNotification({ title: 'Silindi', message: 'Dosya başarıyla kaldırıldı.', type: 'info' });
    }
  };

  const getPublicUrl = (fileName: string) => {
    if (!tenant?.id) return '';
    const { data } = supabase.storage.from('documents').getPublicUrl(`${tenant.id}/${fileName}`);
    return data.publicUrl;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="#6366f1" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Dosyalarınız yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Dosya Yönetimi</h1>
            <p className="page-subtitle">Sözleşmeler, tasarımlar veya müşteri dökümanları ({files.length} dosya)</p>
          </div>
          <div>
            <input 
              type="file" 
              id="file-upload" 
              style={{ display: 'none' }} 
              onChange={handleUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
              {uploading ? 'Yükleniyor...' : 'Yeni Dosya Yükle'}
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {files.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UploadCloud size={32} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Henüz dosya yok</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sözleşmelerinizi veya iş dosyalarınızı buraya yükleyebilirsiniz.</p>
          </div>
        )}

        {files.map((file) => {
          const isImage = file.metadata?.mimetype?.startsWith('image/');
          return (
            <div key={file.name} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                  background: isImage ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', 
                  color: isImage ? '#10b981' : '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isImage ? <ImageIcon size={24} /> : <FileText size={24} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {formatSize(file.metadata?.size)} • {new Date(file.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <a 
                  href={getPublicUrl(file.name)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '12px' }}
                >
                  <Download size={14} style={{ marginRight: '6px' }} /> İndir
                </a>
                <button 
                  onClick={() => handleDelete(file.name)}
                  className="btn btn-danger btn-icon" 
                  style={{ padding: '8px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
