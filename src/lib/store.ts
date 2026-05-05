import { create } from 'zustand';
import { User, Tenant, Notification, Order, Payment, Customer, Appointment, Task } from '@/types';
import { generateMockOrders, generateMockPayments, generateMockCustomers, generateMockAppointments, generateMockTasks } from '@/lib/mockData';

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

  // Actions
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

export const useStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  token: null,
  isAuthenticated: false,
  notifications: [],
  sidebarOpen: true,

  orders: generateMockOrders(),
  payments: generateMockPayments(),
  customers: generateMockCustomers(),
  appointments: generateMockAppointments(),
  tasks: generateMockTasks(),

  setAuth: (user, tenant, token) => {
    if (!user || !tenant) {
      console.error('Invalid auth data provided to setAuth');
      return;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_token', token);
      localStorage.setItem('saas_user', JSON.stringify(user));
      localStorage.setItem('saas_tenant', JSON.stringify(tenant));
    }
    set({ 
      user, 
      tenant, 
      token, 
      isAuthenticated: true,
      orders: generateMockOrders().filter(o => o.tenant_id === tenant.id),
      payments: generateMockPayments().filter(p => p.tenant_id === tenant.id),
      customers: generateMockCustomers().filter(c => c.tenant_id === tenant.id),
      appointments: generateMockAppointments().filter(a => a.tenant_id === tenant.id),
      tasks: generateMockTasks().filter(t => t.tenant_id === tenant.id),
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saas_token');
      localStorage.removeItem('saas_user');
      localStorage.removeItem('saas_tenant');
    }
    set({ user: null, tenant: null, token: null, isAuthenticated: false });
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

  addPayment: (payment) => set((state) => {
    const newPayments = [payment, ...state.payments];
    const newOrders = [...state.orders];
    
    // Ledger logic: if payment is linked to an order, deduct remaining balance
    if (payment.order_id) {
      const orderIndex = newOrders.findIndex(o => o.id === payment.order_id);
      if (orderIndex !== -1) {
        const order = newOrders[orderIndex];
        const currentBalance = order.remaining_balance ?? (order.price - order.deposit);
        const newBalance = Math.max(0, currentBalance - payment.amount);
        
        newOrders[orderIndex] = {
          ...order,
          remaining_balance: newBalance,
          // if paid off, auto mark ready
          status: newBalance === 0 && order.status === 'in_progress' ? 'ready' : order.status
        };
      }
    }
    return { payments: newPayments, orders: newOrders };
  }),

  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o)
  })),

  addAppointment: (appointment) => set((state) => ({ appointments: [appointment, ...state.appointments] })),
  updateAppointment: (id, updates) => set((state) => ({
    appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id)
  })),
}));
