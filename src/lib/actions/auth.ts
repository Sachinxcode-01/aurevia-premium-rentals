"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AuthResult {
  success: boolean;
  error?: string;
  role?: string;
}

// ─── Sign In ─────────────────────────────────────────────────
export async function signInAction(email: string, password: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const profile = profileData as { role: string } | null;
  revalidatePath("/");
  return { success: true, role: profile?.role ?? "customer" };
}

// ─── Sign Up ─────────────────────────────────────────────────
export async function signUpAction(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: "User creation failed." };

  const { error: profileErr } = await supabase.from("profiles").insert([{
    id: data.user.id,
    full_name: fullName,
    email,
    phone,
    role: "customer",
    avatar_url: null,
  }] as never[]);

  if (profileErr) {
    return { success: false, error: "Failed to create profile: " + profileErr.message };
  }

  revalidatePath("/");
  return { success: true, role: "customer" };
}

// ─── Sign Out ────────────────────────────────────────────────
export async function signOutAction(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// ─── Get current user profile ────────────────────────────────
export async function getCurrentUserAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profileData as Record<string, unknown> | null;
}

// ─── Update profile ──────────────────────────────────────────
export async function updateProfileAction(
  fullName: string,
  phone: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone } as never)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}
