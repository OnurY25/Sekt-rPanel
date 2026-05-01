'use client';

import { useStore } from '@/lib/store';
import { FileText, Upload, Folder, Image, FileSpreadsheet, Download, Plus } from 'lucide-react';

const MOCK_FILES = [
  { id: 'f1', name: 'Sipariş_Ahmet_Yilmaz.pdf', type: 'pdf', size: '124 KB', date: '2024-05-28', related: 'Ahmet Yılmaz' },
  { id: 'f2', name: 'olcu_formu_terzi.xlsx', type: 'excel', size: '48 KB', date: '2024-05-26', related: 'Sipariş #001' },
  { id: 'f3', name: 'kumaş_örneği.jpg', type: 'image', size: '2.4 MB', date: '2024-05-24', related: 'Genel' },
  { id: 'f4', name: 'Fatura_Mayis_2024.pdf', type: 'pdf', size: '89 KB', date: '2024-05-01', related: 'Muhasebe' },
  { id: 'f5', name: 'Müşteri_Listesi.xlsx', type: 'excel', size: '156 KB', date: '2024-04-30', related: 'Genel' },
];

const FILE_ICONS: Record<string, any> = {
  pdf: { icon: <FileText size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  excel: { icon: <FileSpreadsheet size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  image: { icon: <Image size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  default: { icon: <FileText size={20} />, color: '#8b9ab5', bg: 'rgba(139,154,181,0.1)' },
};

export default function FilesPage() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Dosya Yönetimi</h1>
            <p className="page-subtitle">{MOCK_FILES.length} dosya · 3.0 MB kullanıldı</p>
          </div>
          <button className="btn btn-primary">
            <Upload size={16} /> Dosya Yükle
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card" style={{ padding: '32px', marginBottom: '20px', textAlign: 'center', border: '2px dashed rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.03)', cursor: 'pointer' }}>
        <Upload size={28} style={{ color: '#818cf8', margin: '0 auto 8px' }} />
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Dosya Sürükle & Bırak</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PDF, Excel, Word, JPG, PNG · Maks 10MB</div>
      </div>

      {/* File Grid */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dosya Adı</th>
                <th>İlgili</th>
                <th>Boyut</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FILES.map((file) => {
                const icon = FILE_ICONS[file.type] || FILE_ICONS.default;
                return (
                  <tr key={file.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: icon.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: icon.color, flexShrink: 0 }}>
                          {icon.icon}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{file.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{file.related}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{file.size}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{file.date}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">
                        <Download size={12} /> İndir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
