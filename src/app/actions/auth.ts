'use server';

import { createClient } from '@/lib/supabase/server';
import { MOCK_TENANTS } from '@/lib/mockData';

export async function loginAction(email: string, password?: string) {
  const pass = password || 'Demo1234!'; // Default password for demo accounts

  // If Supabase is not configured yet, allow demo mock login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const isDemo = Object.keys(MOCK_TENANTS).includes(email) || email === 'admin@demo.com';
    if (isDemo) {
      return { 
        success: true, 
        user: { id: 'mock-user-1', email },
        profile: { name: MOCK_TENANTS[email]?.company + ' Admin' || 'Admin' } 
      };
    }
    return { error: 'Supabase yapılandırılmamış ve geçersiz demo hesabı girdiniz.' };
  }

  const supabase = await createClient();

  // Attempt login
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
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
    return { error: error.message };
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
