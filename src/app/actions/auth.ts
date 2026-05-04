'use server';

import { createClient } from '@/lib/supabase/server';
import { MOCK_TENANTS } from '@/lib/mockData';

export async function loginAction(email: string, password?: string) {
  const sanitizedEmail = email.trim().toLowerCase();
  const pass = password || 'Demo1234!'; // Default password for demo accounts

  // If Supabase is not configured yet, allow demo mock login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const isDemo = Object.keys(MOCK_TENANTS).includes(sanitizedEmail) || sanitizedEmail === 'admin@demo.com';
    if (isDemo) {
      return { 
        success: true, 
        user: { id: 'mock-user-1', email: sanitizedEmail },
        profile: { name: MOCK_TENANTS[sanitizedEmail]?.company + ' Admin' || 'Admin' } 
      };
    }
    return { error: 'Supabase yapılandırılmamış ve geçersiz demo hesabı girdiniz.' };
  }

  const supabase = await createClient();

  // Attempt login
  let { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password: pass,
  });

  // If login fails (user does not exist), let's auto-create it for Demo accounts
  if (error && error.message.includes('Invalid login credentials')) {
    const isDemo = Object.keys(MOCK_TENANTS).includes(email);
    if (isDemo) {
      // Auto register demo account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: MOCK_TENANTS[email].company + ' Admin',
          }
        }
      });
      
      if (signUpError) {
        return { error: signUpError.message };
      }
      data = signUpData as any;
    } else {
      return { error: 'E-posta veya şifre hatalı.' };
    }
  } else if (error) {
    let msg = error.message;
    if (msg.includes('Email not confirmed')) msg = 'Lütfen e-posta adresinizi doğrulayın. (Eğer test ortamındaysanız Supabase panelinden "Confirm Email" ayarını kapatın)';
    if (msg.includes('Unable to validate email address') || msg.includes('invalid format')) msg = 'Lütfen geçerli bir e-posta adresi giriniz (örnek: info@firma.com).';
    return { error: msg };
  }

  // At this point we are authenticated. We need to check if the tenant exists.
  // In a real app we'd query the profiles and tenants table.
  // Since RLS is enabled, we just query profiles:
  const { data: profile } = await supabase.from('profiles').select('*, tenants(*)').eq('id', data.user?.id).single();

  return { 
    success: true, 
    user: data.user,
    profile 
  };
}

export async function logoutAction() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: true };
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function registerAction(email: string, password: string, company_name: string, sector: string) {
  const sanitizedEmail = email.trim().toLowerCase();
  
  if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
    return { error: 'Geçersiz bir e-posta adresi girdiniz.' };
  }

  const { headers } = await import('next/headers');
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const supabase = await createClient();

  // Check IP limit
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { count, error: countError } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip);

    if (countError) {
      console.error("IP check error:", countError);
    } else if (count !== null && count >= 2) {
      return { error: 'Bu cihazdan çok fazla hesap oluşturuldu. Güvenlik nedeniyle aynı cihazdan en fazla 2 hesap açabilirsiniz.' };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
    options: {
      data: {
        full_name: company_name + ' Yöneticisi',
        company_name,
        sector,
        ip_address: ip
      }
    }
  });

  if (error) {
    let msg = error.message;
    if (msg.includes('already registered')) msg = 'Bu e-posta adresi zaten sistemimizde kayıtlı.';
    if (msg.includes('Password should be at least')) msg = 'Şifreniz en az 6 karakter olmalıdır.';
    if (msg.includes('rate limit')) msg = 'Çok fazla kayıt denemesi yaptınız, lütfen birkaç dakika bekleyin.';
    if (msg.includes('Unable to validate email address') || msg.includes('invalid format')) msg = 'Lütfen geçerli bir e-posta adresi giriniz (örnek: info@firma.com).';
    return { error: msg };
  }

  // Auto-confirm logic
  if (data.user && !data.session) {
    if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      // Forcibly confirm the user's email
      const { error: confirmError } = await adminClient.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.error("Auto confirm error:", confirmError);
      }
    } else {
      return { error: 'Kayıt başarılı! Ancak sisteme girmek için Supabase üzerinden "Confirm Email" ayarını kapatmanız gerekmektedir.' };
    }
  }

  return { success: true, user: data.user };
}
