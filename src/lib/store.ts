import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Tenant, Notification, Order, Payment, Customer, Appointment, Task } from '@/types';
import { generateMockOrders, generateMockPayments, generateMockCustomers, generateMockAppointments, generateMockTasks } from '@/lib/mockData';

// ─── Demo tenant IDs ───────────────────────────────────────────────────────────
const DEMO_TENANT_IDS = ['t_terzi', 't_mobilya', 't_klinik', 't_matbaa', 't_servis', 't_admin'];

// ─── Get data for a tenant — demo accounts get mock data, real gets all as sample ─
const getDataForTenant = (tenantId: string) => {
  const isDemoTenant = DEMO_TENANT_IDS.includes(tenantId);
  
  if (isDemoTenant) {
    // Demo accounts: filter by their specific tenant_id
    return {
      orders: generateMockOrders().filter(o => o.tenant_id === tenantId),
      payments: generateMockPayments().filter(p => p.tenant_id === tenantId),
      customers: generateMockCustomers().filter(c => c.tenant_id === tenantId),
      appointments: generateMockAppointments().filter(a => a.tenant_id === tenantId),
      tasks: generateMockTasks().filter(t => t.tenant_id === tenantId),
    };
  }

  // Real new accounts: re-tag all mock data with the real tenant's ID so the dashboard looks populated
  const retagId = (items: any[]) => items.map(item => ({ ...item, tenant_id: tenantId }));
  return {
    orders: retagId(generateMockOrders()),
    payments: retagId(generateMockPayments()),
    customers: retagId(generateMockCustomers()),
    appointments: retagId(generateMockAppointments()),
    tasks: retagId(generateMockTasks()),
  };
};

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  sidebarOpen: boolean;

  // Data Store
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

  // CRUD Actions
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

      // Initial data — empty until setAuth is called
      orders: [],
      payments: [],
      customers: [],
      appointments: [],
      tasks: [],

      setAuth: (user, tenant, token) => {
        if (!user || !tenant) {
          console.error('[store] Invalid auth data');
          return;
        }
        const data = getDataForTenant(tenant.id);
        set({
          user,
          tenant,
          token,
          isAuthenticated: true,
          ...data,
        });
      },

      logout: () => {
        set({
          user: null,
          tenant: null,
          token: null,
          isAuthenticated: false,
          orders: [],
          payments: [],
          customers: [],
          appointments: [],
          tasks: [],
        });
      },

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).slice(2),
          created_at: new Date().toISOString(),
          read: false,
        };
        set((state) => ({ notifications: [newNotif, ...state.notifications].slice(0, 50) }));
      },

      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addPayment: (payment) =>
        set((state) => {
          const newPayments = [payment, ...state.payments];
          const newOrders = [...state.orders];
          if (payment.order_id) {
            const idx = newOrders.findIndex((o) => o.id === payment.order_id);
            if (idx !== -1) {
              const order = newOrders[idx];
              const currentBalance = order.remaining_balance ?? order.price - order.deposit;
              const newBalance = Math.max(0, currentBalance - payment.amount);
              newOrders[idx] = {
                ...order,
                remaining_balance: newBalance,
                status: newBalance === 0 && order.status === 'in_progress' ? 'ready' : order.status,
              };
            }
          }
          return { payments: newPayments, orders: newOrders };
        }),

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, updates) =>
        set((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)) })),

      addAppointment: (appointment) =>
        set((state) => ({ appointments: [appointment, ...state.appointments] })),
      updateAppointment: (id, updates) =>
        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

      addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
    }),
    {
      name: 'saas-store', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist auth fields — data arrays are rehydrated from setAuth
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sidebarOpen: state.sidebarOpen,
      }),
      // After hydration, if authenticated, repopulate data arrays from mock
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state.tenant) {
          const data = getDataForTenant(state.tenant.id);
          state.orders = data.orders;
          state.payments = data.payments;
          state.customers = data.customers;
          state.appointments = data.appointments;
          state.tasks = data.tasks;
        }
      },
    }
  )
);
