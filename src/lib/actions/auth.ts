"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AuthResult {
  success: boolean;
  error?: string;
  role?: string;
  needsVerification?: boolean;
}

// ─── Sign In ─────────────────────────────────────────────────
export async function signInAction(email: string, password: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Map Supabase error codes to human-readable messages
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
      return { success: false, error: "Incorrect email or password. Please try again." };
    }
    if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
      return { success: false, error: "Your email is not verified yet.", needsVerification: true };
    }
    if (msg.includes("too many")) {
      return { success: false, error: "Too many login attempts. Please wait a moment and try again." };
    }
    return { success: false, error: error.message };
  }

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }
    return { success: false, error: error.message };
  }
  if (!data.user) return { success: false, error: "User creation failed." };

  // Upsert profile (may already exist from DB trigger)
  await supabase.from("profiles").upsert([{
    id: data.user.id,
    full_name: fullName,
    email,
    phone,
    role: "customer",
    avatar_url: null,
  }] as never[]);

  revalidatePath("/");
  // If session is null, email confirmation is required
  const needsVerification = !data.session;
  return { success: true, role: "customer", needsVerification };
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

// ─── Forgot Password ─────────────────────────────────────────
export async function forgotPasswordAction(email: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Reset Password (after email link) ───────────────────────
export async function resetPasswordAction(newPassword: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    if (error.message.toLowerCase().includes("same password")) {
      return { success: false, error: "New password must be different from your current password." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

// ─── Change Password (logged in) ─────────────────────────────
export async function changePasswordAction(
  newPassword: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Resend Verification Email ────────────────────────────────
export async function resendVerificationAction(email: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
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
