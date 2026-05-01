import { Customer, Order, Payment, Appointment, Task, DashboardStats, AuditLog } from '@/types';

// ─── Mock Tenant Database ────────────────────────────────────────────────────
export const MOCK_TENANTS: Record<string, { sector: string; company: string; plan: string }> = {
  'terzi@demo.com': { sector: 'tailor', company: 'Onur Terzi Atölyesi', plan: 'pro' },
  'mobilya@demo.com': { sector: 'furniture', company: 'Nova Mobilya', plan: 'starter' },
  'klinik@demo.com': { sector: 'dental', company: 'Sağlıklı Gülüş Kliniği', plan: 'enterprise' },
  'matbaa@demo.com': { sector: 'printing', company: 'Renkli Matbaa', plan: 'pro' },
  'servis@demo.com': { sector: 'autoservice', company: 'Oto Servis Plus', plan: 'starter' },
  'admin@demo.com': { sector: 'tailor', company: 'Admin Demo', plan: 'enterprise' },
};

// ─── Mock Customers ──────────────────────────────────────────────────────────
export const generateMockCustomers = (): Customer[] => [
  { id: 'c1', tenant_id: 't1', name: 'Ahmet Yılmaz', phone: '0532 111 2233', email: 'ahmet@mail.com', address: 'Kadıköy, İstanbul', total_orders: 5, total_spent: 8500, created_at: '2024-01-15T10:00:00Z', tags: ['VIP'] },
  { id: 'c2', tenant_id: 't1', name: 'Fatma Kaya', phone: '0545 222 3344', email: 'fatma@mail.com', address: 'Şişli, İstanbul', total_orders: 3, total_spent: 4200, created_at: '2024-02-20T10:00:00Z', tags: [] },
  { id: 'c3', tenant_id: 't1', name: 'Mehmet Demir', phone: '0551 333 4455', email: 'mehmet@mail.com', address: 'Beşiktaş, İstanbul', total_orders: 8, total_spent: 15600, created_at: '2024-03-05T10:00:00Z', tags: ['VIP', 'Düzenli'] },
  { id: 'c4', tenant_id: 't1', name: 'Zeynep Arslan', phone: '0536 444 5566', total_orders: 2, total_spent: 1800, created_at: '2024-04-10T10:00:00Z', tags: [] },
  { id: 'c5', tenant_id: 't1', name: 'Ali Çelik', phone: '0542 555 6677', email: 'ali@mail.com', address: 'Ümraniye, İstanbul', total_orders: 1, total_spent: 950, created_at: '2024-05-01T10:00:00Z', tags: ['Yeni'] },
  { id: 'c6', tenant_id: 't1', name: 'Ayşe Şahin', phone: '0537 666 7788', email: 'ayse@mail.com', total_orders: 4, total_spent: 6300, created_at: '2024-01-28T10:00:00Z', tags: [] },
  { id: 'c7', tenant_id: 't1', name: 'Mustafa Öztürk', phone: '0549 777 8899', address: 'Maltepe, İstanbul', total_orders: 6, total_spent: 11200, created_at: '2024-02-14T10:00:00Z', tags: ['VIP'] },
  { id: 'c8', tenant_id: 't1', name: 'Elif Korkmaz', phone: '0553 888 9900', email: 'elif@mail.com', total_orders: 2, total_spent: 3400, created_at: '2024-03-22T10:00:00Z', tags: [] },
];

// ─── Mock Orders ─────────────────────────────────────────────────────────────
export const generateMockOrders = (): Order[] => [
  { id: 'o1', tenant_id: 't1', customer_id: 'c1', customer: { id: 'c1', name: 'Ahmet Yılmaz' }, title: 'Takım Elbise - Lacivert', status: 'in_progress', price: 3500, deposit: 1000, remaining_balance: 2500, due_date: '2024-06-15', created_at: '2024-05-20T10:00:00Z', notes: 'Düğün için acil', custom_data: { kumaş: 'İtalyan', renk: 'Lacivert' } },
  { id: 'o2', tenant_id: 't1', customer_id: 'c2', customer: { id: 'c2', name: 'Fatma Kaya' }, title: 'Abiye Elbise - Kırmızı', status: 'waiting_approval', price: 2800, deposit: 500, remaining_balance: 2300, due_date: '2024-06-20', created_at: '2024-05-22T10:00:00Z' },
  { id: 'o3', tenant_id: 't1', customer_id: 'c3', customer: { id: 'c3', name: 'Mehmet Demir' }, title: 'Smokin Takım', status: 'ready', price: 5200, deposit: 2000, remaining_balance: 3200, due_date: '2024-06-10', created_at: '2024-05-10T10:00:00Z' },
  { id: 'o4', tenant_id: 't1', customer_id: 'c4', customer: { id: 'c4', name: 'Zeynep Arslan' }, title: 'Gelinlik Tadilat', status: 'pending', price: 800, deposit: 200, remaining_balance: 600, due_date: '2024-06-25', created_at: '2024-05-25T10:00:00Z' },
  { id: 'o5', tenant_id: 't1', customer_id: 'c5', customer: { id: 'c5', name: 'Ali Çelik' }, title: 'Pantolon - 2 Adet', status: 'delivered', price: 950, deposit: 950, remaining_balance: 0, due_date: '2024-05-28', created_at: '2024-05-15T10:00:00Z' },
  { id: 'o6', tenant_id: 't1', customer_id: 'c6', customer: { id: 'c6', name: 'Ayşe Şahin' }, title: 'Kostüm Takım - Gri', status: 'in_progress', price: 4100, deposit: 1500, remaining_balance: 2600, due_date: '2024-07-01', created_at: '2024-05-28T10:00:00Z' },
  { id: 'o7', tenant_id: 't1', customer_id: 'c7', customer: { id: 'c7', name: 'Mustafa Öztürk' }, title: 'Yazlık Takım - Bej', status: 'pending', price: 2600, deposit: 800, remaining_balance: 1800, due_date: '2024-06-18', created_at: '2024-05-27T10:00:00Z' },
  { id: 'o8', tenant_id: 't1', customer_id: 'c8', customer: { id: 'c8', name: 'Elif Korkmaz' }, title: 'Etek - 3 Parça', status: 'cancelled', price: 1200, deposit: 300, remaining_balance: 900, due_date: '2024-06-05', created_at: '2024-05-18T10:00:00Z' },
];

// ─── Mock Payments ───────────────────────────────────────────────────────────
export const generateMockPayments = (): Payment[] => [
  { id: 'p1', tenant_id: 't1', order_id: 'o1', order: { id: 'o1', title: 'Takım Elbise - Lacivert' }, customer_id: 'c1', customer: { id: 'c1', name: 'Ahmet Yılmaz' }, amount: 1000, type: 'cash', paid_at: '2024-05-20T11:00:00Z', notes: 'Kapora' },
  { id: 'p2', tenant_id: 't1', order_id: 'o2', order: { id: 'o2', title: 'Abiye Elbise - Kırmızı' }, customer_id: 'c2', customer: { id: 'c2', name: 'Fatma Kaya' }, amount: 500, type: 'card', paid_at: '2024-05-22T12:00:00Z' },
  { id: 'p3', tenant_id: 't1', order_id: 'o3', order: { id: 'o3', title: 'Smokin Takım' }, customer_id: 'c3', customer: { id: 'c3', name: 'Mehmet Demir' }, amount: 5200, type: 'transfer', paid_at: '2024-06-08T09:00:00Z', notes: 'Tam ödeme' },
  { id: 'p4', tenant_id: 't1', order_id: 'o5', order: { id: 'o5', title: 'Pantolon - 2 Adet' }, customer_id: 'c5', customer: { id: 'c5', name: 'Ali Çelik' }, amount: 950, type: 'cash', paid_at: '2024-05-28T15:00:00Z' },
  { id: 'p5', tenant_id: 't1', order_id: 'o6', order: { id: 'o6', title: 'Kostüm Takım - Gri' }, customer_id: 'c6', customer: { id: 'c6', name: 'Ayşe Şahin' }, amount: 1500, type: 'card', paid_at: '2024-05-28T10:00:00Z' },
  { id: 'p6', tenant_id: 't1', order_id: 'o7', order: { id: 'o7', title: 'Yazlık Takım - Bej' }, customer_id: 'c7', customer: { id: 'c7', name: 'Mustafa Öztürk' }, amount: 800, type: 'cash', paid_at: '2024-05-27T14:00:00Z' },
];

// ─── Mock Appointments ───────────────────────────────────────────────────────
export const generateMockAppointments = (): Appointment[] => [
  { id: 'a1', tenant_id: 't1', customer_id: 'c1', customer: { id: 'c1', name: 'Ahmet Yılmaz' }, date: new Date().toISOString().split('T')[0], time: '10:00', status: 'scheduled', service: 'İlk Prova', notes: 'Takım elbise provası' },
  { id: 'a2', tenant_id: 't1', customer_id: 'c2', customer: { id: 'c2', name: 'Fatma Kaya' }, date: new Date().toISOString().split('T')[0], time: '11:30', status: 'scheduled', service: 'Son Prova' },
  { id: 'a3', tenant_id: 't1', customer_id: 'c3', customer: { id: 'c3', name: 'Mehmet Demir' }, date: new Date().toISOString().split('T')[0], time: '14:00', status: 'completed', service: 'Teslim' },
  { id: 'a4', tenant_id: 't1', customer_id: 'c6', customer: { id: 'c6', name: 'Ayşe Şahin' }, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:30', status: 'scheduled', service: 'Ölçü Alma' },
  { id: 'a5', tenant_id: 't1', customer_id: 'c7', customer: { id: 'c7', name: 'Mustafa Öztürk' }, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '13:00', status: 'scheduled', service: 'İlk Prova' },
];

// ─── Mock Tasks ──────────────────────────────────────────────────────────────
export const generateMockTasks = (): Task[] => [
  { id: 't1', tenant_id: 't1', title: 'Ahmet Bey\'in takımını bitir', status: 'in_progress', due_date: new Date().toISOString().split('T')[0], priority: 'high', assigned_to: 'Murat Usta' },
  { id: 't2', tenant_id: 't1', title: 'Fatma Hanım\'a prova randevusu ver', status: 'todo', due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], priority: 'medium', assigned_to: 'Siz' },
  { id: 't3', tenant_id: 't1', title: 'Kumaş siparişi ver', status: 'todo', due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], priority: 'low' },
  { id: 't4', tenant_id: 't1', title: 'Aylık muhasebe hazırla', status: 'done', priority: 'medium' },
  { id: 't5', tenant_id: 't1', title: 'Smokin provası tamamlandı', status: 'done', priority: 'high', assigned_to: 'Murat Usta' },
];

// ─── Mock Dashboard Stats ────────────────────────────────────────────────────
export const generateMockStats = (): DashboardStats => ({
  total_customers: 8,
  total_orders: 8,
  revenue_this_month: 9950,
  pending_orders: 3,
  todays_appointments: 3,
  overdue_tasks: 1,
});

// ─── Mock Audit Logs ─────────────────────────────────────────────────────────
export const generateMockAuditLogs = (): AuditLog[] => [
  { id: 'l1', tenant_id: 't1', user_name: 'Onur Admin', action: 'Sipariş Oluşturdu', entity: 'Order', entity_id: 'o7', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'l2', tenant_id: 't1', user_name: 'Onur Admin', action: 'Müşteri Güncelledi', entity: 'Customer', entity_id: 'c3', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'l3', tenant_id: 't1', user_name: 'Onur Admin', action: 'Ödeme Kaydetti', entity: 'Payment', entity_id: 'p6', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 'l4', tenant_id: 't1', user_name: 'Murat Usta', action: 'Sipariş Durumu Güncelledi', entity: 'Order', entity_id: 'o3', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 'l5', tenant_id: 't1', user_name: 'Onur Admin', action: 'Randevu Oluşturdu', entity: 'Appointment', entity_id: 'a4', created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 'l6', tenant_id: 't1', user_name: 'Murat Usta', action: 'Görev Tamamladı', entity: 'Task', entity_id: 't5', created_at: new Date(Date.now() - 21600000).toISOString() },
];

// ─── Monthly Revenue Chart Data ──────────────────────────────────────────────
export const generateMonthlyRevenue = () => [
  { month: 'Oca', gelir: 8200, siparis: 12 },
  { month: 'Şub', gelir: 9100, siparis: 14 },
  { month: 'Mar', gelir: 7800, siparis: 11 },
  { month: 'Nis', gelir: 11200, siparis: 16 },
  { month: 'May', gelir: 9950, siparis: 13 },
  { month: 'Haz', gelir: 0, siparis: 0 },
];

export const generateWeeklyRevenue = () => [
  { gun: 'Pzt', gelir: 2100 },
  { gun: 'Sal', gelir: 1800 },
  { gun: 'Çar', gelir: 2400 },
  { gun: 'Per', gelir: 1600 },
  { gun: 'Cum', gelir: 3200 },
  { gun: 'Cmt', gelir: 1500 },
  { gun: 'Paz', gelir: 900 },
];
