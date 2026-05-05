import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Tenant, Notification, Order, Payment, Customer, Appointment, Task } from '@/types';
import {
  generateMockOrders, generateMockPayments, generateMockCustomers,
  generateMockAppointments, generateMockTasks,
} from '@/lib/mockData';

// ─── Demo tenant IDs ───────────────────────────────────────────────────────────
const DEMO_TENANT_IDS = ['t_terzi', 't_mobilya', 't_klinik', 't_matbaa', 't_servis', 't_admin'];

const getDataForTenant = (tenantId: string) => {
  const isDemoTenant = DEMO_TENANT_IDS.includes(tenantId);
  if (isDemoTenant) {
    return {
      orders: generateMockOrders().filter(o => o.tenant_id === tenantId),
      payments: generateMockPayments().filter(p => p.tenant_id === tenantId),
      customers: generateMockCustomers().filter(c => c.tenant_id === tenantId),
      appointments: generateMockAppointments().filter(a => a.tenant_id === tenantId),
      tasks: generateMockTasks().filter(t => t.tenant_id === tenantId),
    };
  }
  // Real accounts: retag mock data with their tenant ID so dashboard looks populated
  const retag = (items: any[]) => items.map(i => ({ ...i, tenant_id: tenantId }));
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
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
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
        if (!user || !tenant) { console.error('[store] Invalid auth data'); return; }
        set({ user, tenant, token, isAuthenticated: true, ...getDataForTenant(tenant.id) });
      },

      logout: () => set({
        user: null, tenant: null, token: null, isAuthenticated: false,
        orders: [], payments: [], customers: [], appointments: [], tasks: [],
      }),

      addNotification: (notif) => set((state) => ({
        notifications: [
          { ...notif, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString(), read: false },
          ...state.notifications,
        ].slice(0, 50),
      })),

      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addPayment: (payment) => set((state) => {
        const newOrders = state.orders.map(o => {
          if (o.id !== payment.order_id) return o;
          const bal = Math.max(0, (o.remaining_balance ?? o.price - o.deposit) - payment.amount);
          return { ...o, remaining_balance: bal, status: bal === 0 && o.status === 'in_progress' ? 'ready' as const : o.status };
        });
        return { payments: [payment, ...state.payments], orders: newOrders };
      }),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, updates) => set((state) => ({ orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o) })),
      addAppointment: (a) => set((state) => ({ appointments: [a, ...state.appointments] })),
      updateAppointment: (id, updates) => set((state) => ({ appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a) })),
      addTask: (t) => set((state) => ({ tasks: [t, ...state.tasks] })),
      updateTask: (id, updates) => set((state) => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t) })),
      addCustomer: (c) => set((state) => ({ customers: [c, ...state.customers] })),
      updateCustomer: (id, updates) => set((state) => ({ customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter(c => c.id !== id) })),
    }),
    {
      name: 'saas-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sidebarOpen: state.sidebarOpen,
      }),
      // After hydration, repopulate data arrays using set() — NOT direct mutation
      onRehydrateStorage: () => (state, error) => {
        if (error) { console.error('[store] Hydration error:', error); return; }
        if (state?.isAuthenticated && state.tenant) {
          // Use setTimeout so this runs after the store is fully initialized
          setTimeout(() => {
            useStore.setState(getDataForTenant(state.tenant!.id));
          }, 0);
        }
      },
    }
  )
);
