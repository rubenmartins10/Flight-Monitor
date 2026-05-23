'use server';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData) {
  const email    = formData.get('email');
  const password = formData.get('password');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function registerAction(formData) {
  const email    = formData.get('email');
  const password = formData.get('password');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  redirect('/dashboard');
}