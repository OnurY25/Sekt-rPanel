'use server';

import { createClient } from '@supabase/supabase-js';
import { MOCK_TENANTS } from '@/lib/mockData';

type AuthResult =
  | { success: true; userId: string; email: string; sector: string; companyName: string }
  | { error: string };

// Helper to wrap promise with timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
};

function translateAuthError(msg: string): string {
  if (!msg) return 'Bilinmeyen bir hata oluştu.';
  const m = msg.toLowerCase();
  if (m.includes('user already registered')) return 'Bu e-posta adresi zaten kayıtlı.';
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) return 'E-posta veya şifre hatalı.';
  if (m.includes('email not confirmed')) return 'E-posta henüz doğrulanmamış.';
  return msg;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function registerAction(email: string, password: string, company_name: string, sector: string): Promise<AuthResult> {
  console.log('[auth] Register attempt:', email);
  try {
    const adminClient = getAdminClient();
    if (!adminClient) return { error: 'Supabase yapılandırması eksik.' };

    const result = await withTimeout(
      adminClient.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { full_name: company_name.trim() + ' Yöneticisi', company_name: company_name.trim(), sector },
      }),
      8000,
      'Kayıt işlemi zaman aşımına uğradı.'
    );

    if (result.error) return { error: translateAuthError(result.error.message) };

    return {
      success: true,
      userId: result.data.user!.id,
      email: email.trim().toLowerCase(),
      sector,
      companyName: company_name.trim(),
    };
  } catch (err: any) {
    console.error('[auth] Register error:', err.message);
    return { error: err.message || 'Kayıt hatası.' };
  }
}

export async function loginAction(email: string, password?: string): Promise<AuthResult> {
  console.log('[auth] Login attempt:', email);
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    const pass = password || 'Demo1234!';

    // Mock bypass
    const mockTenant = MOCK_TENANTS[sanitizedEmail];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      if (mockTenant) return { success: true, userId: 'mock-' + mockTenant.id, email: sanitizedEmail, sector: mockTenant.sector, companyName: mockTenant.company };
      return { error: 'Bağlantı ayarları eksik.' };
    }

    const anonClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const result = await withTimeout(
      anonClient.auth.signInWithPassword({ email: sanitizedEmail, password: pass }),
      8000,
      'Giriş işlemi zaman aşımına uğradı.'
    );

    if (result.error) return { error: translateAuthError(result.error.message) };

    return {
      success: true,
      userId: result.data.user!.id,
      email: sanitizedEmail,
      sector: result.data.user!.user_metadata?.sector || mockTenant?.sector || 'other',
      companyName: result.data.user!.user_metadata?.company_name || mockTenant?.company || 'İşletme',
    };
  } catch (err: any) {
    console.error('[auth] Login error:', err.message);
    return { error: err.message || 'Giriş hatası.' };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  return { success: true };
}
