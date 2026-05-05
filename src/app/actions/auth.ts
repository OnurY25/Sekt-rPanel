'use server';

import { createClient } from '@supabase/supabase-js';
import { MOCK_TENANTS } from '@/lib/mockData';

// ─── Plain serializable types ────────────────────────────────────────────────
type AuthResult =
  | { success: true; userId: string; email: string; sector: string; companyName: string }
  | { error: string };

function translateAuthError(msg: string): string {
  if (!msg) return 'Bilinmeyen bir hata oluştu.';
  const m = msg.toLowerCase();
  if (m.includes('user already registered')) return 'Bu e-posta adresi zaten kayıtlı.';
  if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
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

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export async function registerAction(
  email: string,
  password: string,
  company_name: string,
  sector: string
): Promise<AuthResult> {
  console.log('[auth] Register started:', email);
  try {
    const adminClient = getAdminClient();
    if (!adminClient) return { error: 'Supabase URL veya Service Role Key eksik.' };

    // Create user (bypasses email confirmation)
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: company_name.trim() + ' Yöneticisi',
        company_name: company_name.trim(),
        sector,
      },
    });

    if (createError) {
      console.error('[auth] Register error:', createError.message);
      return { error: translateAuthError(createError.message) };
    }

    return {
      success: true,
      userId: created.user!.id,
      email: email.trim().toLowerCase(),
      sector,
      companyName: company_name.trim(),
    };
  } catch (err: any) {
    console.error('[auth] Register exception:', err);
    return { error: 'Sunucu hatası: ' + err.message };
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginAction(
  email: string,
  password?: string
): Promise<AuthResult> {
  console.log('[auth] Login started:', email);
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    const pass = password || 'Demo1234!';

    // Mock bypass
    const mockTenant = MOCK_TENANTS[sanitizedEmail];
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      // If no Supabase, try mock only
      if (mockTenant) return { success: true, userId: 'mock-' + mockTenant.id, email: sanitizedEmail, sector: mockTenant.sector, companyName: mockTenant.company };
      return { error: 'Supabase yapılandırılmamış.' };
    }

    const anonClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signIn, error: signInError } = await anonClient.auth.signInWithPassword({
      email: sanitizedEmail,
      password: pass,
    });

    if (signInError) {
      console.error('[auth] Login error:', signInError.message);
      return { error: translateAuthError(signInError.message) };
    }

    return {
      success: true,
      userId: signIn.user!.id,
      email: sanitizedEmail,
      sector: (signIn.user!.user_metadata?.sector) || mockTenant?.sector || 'other',
      companyName: (signIn.user!.user_metadata?.company_name) || mockTenant?.company || 'İşletme',
    };
  } catch (err: any) {
    console.error('[auth] Login exception:', err);
    return { error: 'Giriş hatası: ' + err.message };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  return { success: true };
}
