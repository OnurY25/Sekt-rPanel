export type Sector = 'tailor' | 'furniture' | 'dental' | 'printing' | 'autoservice';

export type Role = 'owner' | 'manager' | 'staff' | 'viewer';

export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise';

export type OrderStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_approval'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentType = 'cash' | 'card' | 'transfer' | 'deposit';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  sector: Sector;
  plan: Plan;
  status: 'active' | 'suspended' | 'trial';
  trial_ends_at?: string;
  created_at: string;
  logo?: string;
  primary_color?: string;
  currency: string;
  language: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  total_orders?: number;
  total_spent?: number;
  created_at: string;
  tags?: string[];
  stage?: string;
  source?: string;
  estimated_value?: number;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer?: { id: string; name: string };
  title: string;
  status: OrderStatus;
  price: number;
  deposit: number;
  remaining_balance?: number;
  due_date: string;
  custom_data?: Record<string, any>;
  created_at: string;
  notes?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  order_id?: string;
  order?: { id: string; title: string };
  customer_id: string;
  customer?: { id: string; name: string };
  amount: number;
  type: PaymentType;
  paid_at: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  customer_id: string;
  customer?: { id: string; name: string };
  date: string;
  time?: string;
  status: AppointmentStatus;
  notes?: string;
  service?: string;
}

export interface SubscriptionInvoice {
  id: string;
  tenant_id: string;
  plan: Plan;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  billing_cycle: 'monthly' | 'yearly';
  paid_at?: string;
  due_date: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  assigned_to?: string;
  status: TaskStatus;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
}

export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  revenue_this_month: number;
  pending_orders: number;
  todays_appointments?: number;
  overdue_tasks?: number;
}

export interface SectorFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
}

export interface SectorConfig {
  id: Sector;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  orderFields: SectorFieldSchema[];
  features: string[];
  dashboardWidgets: string[];
}
