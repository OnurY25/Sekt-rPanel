import { create } from 'zustand';
import { User, Tenant, Notification, Order, Payment, Customer, Appointment, Task } from '@/types';
import {
  generateMockOrders, generateMockPayments, generateMockCustomers,
  generateMockAppointments, generateMockTasks,
} from '@/lib/mockData';

export const SESSION_KEY = 'saas_session';

export type SessionData = { user: User; tenant: Tenant; token: string };

export const saveSession = (user: User, tenant: Tenant, token: string) => {
  try { 
    if (!user || !tenant) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, tenant, token })); 
  } catch (e) { console.error('Save session error:', e); }
};

export const loadSession = (): SessionData | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      // STRICT CHECK: Must have both user and tenant with IDs
      if (d && d.user?.id && d.tenant?.id && d.token) {
        return d as SessionData;
      }
    }
    
    // Legacy/Old Format Migration (One time only)
    const u = localStorage.getItem('saas_user');
    const t = localStorage.getItem('saas_tenant');
    const tk = localStorage.getItem('saas_token');
    if (u && t && tk) {
      const user = JSON.parse(u);
      const tenant = JSON.parse(t);
      if (user?.id && tenant?.id) {
        saveSession(user, tenant, tk);
        ['saas_user', 'saas_tenant', 'saas_token', 'saas-store'].forEach(k => localStorage.removeItem(k));
        return { user, tenant, token: tk };
      }
    }
  } catch (e) { console.error('Load session error:', e); }
  return null;
};

export const clearSession = () => {
  try {
    ['saas_session', 'saas_user', 'saas_tenant', 'saas_token', 'saas-store'].forEach(k => localStorage.removeItem(k));
  } catch (e) {}
};

const DEMO_TENANT_IDS = ['t_terzi', 't_mobilya', 't_klinik', 't_matbaa', 't_servis', 't_admin'];

const getDataForTenant = (tenantId: string) => {
  const isDemoTenant = DEMO_TENANT_IDS.includes(tenantId);
  const retag = (items: any[]) => items.map(i => ({ ...i, tenant_id: tenantId }));
  if (isDemoTenant) {
    return {
      orders: generateMockOrders().filter(o => o.tenant_id === tenantId),
      payments: generateMockPayments().filter(p => p.tenant_id === tenantId),
      customers: generateMockCustomers().filter(c => c.tenant_id === tenantId),
      appointments: generateMockAppointments().filter(a => a.tenant_id === tenantId),
      tasks: generateMockTasks().filter(t => t.tenant_id === tenantId),
    };
  }
  return {
    orders: retag(generateMockOrders()),
    payments: retag(generateMockPayments()),
    customers: retag(generateMockCustomers()),
    appointments: retag(generateMockAppointments()),
    tasks: retag(generateMockTasks()),
  };
};

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  sidebarOpen: boolean;
  orders: Order[];
  payments: Payment[];
  customers: Customer[];
  appointments: Appointment[];
  tasks: Task[];

  setAuth: (user: User, tenant: Tenant, token: string) => void;
  logout: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markAllRead: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addPayment: (payment: Payment) => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: string, u: Partial<Order>) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, u: Partial<Appointment>) => void;
  addTask: (t: Task) => void;
  updateTask: (id: string, u: Partial<Task>) => void;
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, u: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

export const useStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  token: null,
  isAuthenticated: false,
  notifications: [],
  sidebarOpen: true,
  orders: [],
  payments: [],
  customers: [],
  appointments: [],
  tasks: [],

  setAuth: (user, tenant, token) => {
    if (!user?.id || !tenant?.id) return;
    saveSession(user, tenant, token);
    set({ user, tenant, token, isAuthenticated: true, ...getDataForTenant(tenant.id) });
  },

  logout: () => {
    clearSession();
    set({ user: null, tenant: null, token: null, isAuthenticated: false, orders: [], payments: [], customers: [], appointments: [], tasks: [] });
    window.location.href = '/';
  },

  addNotification: (notif) => set((s) => ({
    notifications: [{ ...notif, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString(), read: false }, ...s.notifications].slice(0, 50),
  })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addPayment: (payment) => set((s) => {
    const orders = s.orders.map(o => {
      if (o.id !== payment.order_id) return o;
      const bal = Math.max(0, (o.remaining_balance ?? o.price - o.deposit) - payment.amount);
      return { ...o, remaining_balance: bal, status: bal === 0 && o.status === 'in_progress' ? 'ready' as const : o.status };
    });
    return { payments: [payment, ...s.payments], orders };
  }),

  addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
  updateOrder: (id, u) => set((s) => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...u } : o) })),
  addAppointment: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
  updateAppointment: (id, u) => set((s) => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, ...u } : a) })),
  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
  updateTask: (id, u) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...u } : t) })),
  addCustomer: (c) => set((s) => ({ customers: [c, ...s.customers] })),
  updateCustomer: (id, u) => set((s) => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...u } : c) })),
  deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter(c => c.id !== id) })),
}));
