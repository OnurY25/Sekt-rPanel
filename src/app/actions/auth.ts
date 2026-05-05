'use server';

import { createClient } from '@supabase/supabase-js';
import { MOCK_TENANTS } from '@/lib/mockData';

// ─── Plain serializable types (NO Supabase objects) ──────────────────────────
type AuthResult =
  | { success: true; userId: string; email: string; sector: string; companyName: string }
  | { error: string };

// ─── Error translation ────────────────────────────────────────────────────────
function translateAuthError(msg: string): string {
  if (!msg) return 'Bilinmeyen bir hata oluştu.';
  const m = msg.toLowerCase();
  if (m.includes('user already registered') || m.includes('already registered') || m.includes('already been registered'))
    return 'Bu e-posta adresi zaten sistemimizde kayıtlı.';
  if (m.includes('password should be at least') || m.includes('weak_password'))
    return 'Şifreniz en az 6 karakter olmalıdır.';
  if (m.includes('rate limit') || m.includes('email rate'))
    return 'Çok fazla deneme yaptınız, lütfen birkaç dakika bekleyin.';
  if (m.includes('unable to validate email') || m.includes('invalid format') || m.includes('invalid email'))
    return 'Lütfen geçerli bir e-posta adresi giriniz (örnek: info@firma.com).';
  if (m.includes('email not confirmed'))
    return 'E-posta adresiniz henüz doğrulanmamış.';
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'E-posta veya şifre hatalı.';
  if (m.includes('signup disabled') || m.includes('signups not allowed'))
    return 'Şu an yeni kayıtlar kapalı. Lütfen yönetici ile iletişime geçin.';
  if (m.includes('email signups are disabled'))
    return 'E-posta ile kayıt şu an devre dışı. Supabase panelinden "Enable email signup" ayarını açın.';
  return msg;
}

// ─── Helper: build admin client ───────────────────────────────────────────────
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
  try {
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
      return { error: 'Lütfen geçerli bir e-posta adresi giriniz (örnek: info@firma.com).' };
    }
    if (!company_name.trim()) {
      return { error: 'Lütfen işletme adınızı girin.' };
    }
    if (password.length < 6) {
      return { error: 'Şifreniz en az 6 karakter olmalıdır.' };
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return { error: 'Sunucu yapılandırması eksik. Lütfen yönetici ile iletişime geçin.' };
    }

    // ── IP rate limit check ───────────────────────────────────────────────────
    let ip = 'unknown';
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    } catch (_) {}

    const { count } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip);

    if ((count ?? 0) >= 2 && ip !== 'unknown') {
      return {
        error:
          'Bu cihazdan çok fazla hesap oluşturuldu. Güvenlik nedeniyle aynı cihazdan en fazla 2 hesap açabilirsiniz.',
      };
    }

    // ── Create user (admin API bypasses email confirmation) ───────────────────
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: company_name.trim() + ' Yöneticisi',
        company_name: company_name.trim(),
        sector,
        ip_address: ip,
      },
    });

    if (createError) {
      return { error: translateAuthError(createError.message) };
    }

    if (!created?.user) {
      return { error: 'Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.' };
    }

    // Return only plain serializable data — NO Supabase User objects
    return {
      success: true,
      userId: created.user.id,
      email: sanitizedEmail,
      sector,
      companyName: company_name.trim(),
    };
  } catch (err: any) {
    console.error('[registerAction] Unhandled error:', err);
    return { error: translateAuthError(err?.message || 'Sunucu hatası oluştu. Lütfen tekrar deneyin.') };
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginAction(
  email: string,
  password?: string
): Promise<AuthResult | { error: string }> {
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    const pass = password || 'Demo1234!';

    // ── Mock / demo accounts ──────────────────────────────────────────────────
    const mockTenant = MOCK_TENANTS[sanitizedEmail];
    if (mockTenant && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return {
        success: true,
        userId: 'mock-' + mockTenant.id,
        email: sanitizedEmail,
        sector: mockTenant.sector,
        companyName: mockTenant.company,
      };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return { error: 'Supabase yapılandırılmamış.' };
    }

    // Use admin client for sign-in to avoid cookie serialization issues in server actions
    const adminClient = getAdminClient();
    if (!adminClient) {
      return { error: 'Sunucu yapılandırması eksik.' };
    }

    // Verify credentials by attempting sign-in with a temporary anon client
    const anonClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signIn, error: signInError } = await anonClient.auth.signInWithPassword({
      email: sanitizedEmail,
      password: pass,
    });

    if (signInError) {
      return { error: translateAuthError(signInError.message) };
    }

    if (!signIn?.user) {
      return { error: 'Giriş yapılamadı. Lütfen tekrar deneyin.' };
    }

    // Fetch profile with tenant info
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*, tenants(*)')
      .eq('id', signIn.user.id)
      .single();

    const tenantSector = profile?.tenants?.sector || mockTenant?.sector || 'other';
    const tenantCompany = profile?.tenants?.company_name || mockTenant?.company || 'İşletme';

    return {
      success: true,
      userId: signIn.user.id,
      email: sanitizedEmail,
      sector: tenantSector,
      companyName: tenantCompany,
    };
  } catch (err: any) {
    console.error('[loginAction] Unhandled error:', err);
    return { error: translateAuthError(err?.message || 'Giriş sırasında bir hata oluştu.') };
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<{ success: boolean }> {
  // Session is managed client-side via Zustand; just return success
  return { success: true };
}
