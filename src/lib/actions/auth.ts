"use server";

import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
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

// ─── Sign Up (Native Supabase Auth) ──────────────────────────
export async function signUpAction(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<AuthResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const supabase = await createServerSupabaseClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Attempt native Supabase Auth sign up (uses Supabase default email service)
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || "",
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }
    return { success: false, error: error.message };
  }

  if (data.user) {
    try {
      const serviceSupabase = await createServiceSupabaseClient();
      await serviceSupabase.from("profiles").upsert([
        {
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName,
          phone: phone || "",
          role: "customer",
          avatar_url: null,
        },
      ] as never[]);
    } catch {
      // Fallback: profile will be created on first callback or login
    }
  }

  if (data.session) {
    revalidatePath("/");
    return { success: true, role: "customer" };
  }

  // If email confirmation is required by Supabase project settings
  return { success: true, needsVerification: true };
}

// ─── Legacy OTP Helper (Optional) ────────────────────────────
export async function requestSignUpOTPAction(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<AuthResult> {
  return signUpAction(email, password, fullName, phone);
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
  try {
    // Race against a 4-second timeout so the dashboard never hangs indefinitely
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 4000)
    );

    const fetchPromise = (async () => {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profileData as Record<string, unknown> | null;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    console.warn("getCurrentUserAction failed or unconfigured:", err);
    return null;
  }
}

// In-memory OTP store (10 minute expiry)
const resetOtpStore = new Map<string, { otp: string; expiresAt: number }>();

// ─── Forgot Password (Send 6-Digit Email OTP) ────────────────
export async function sendResetOTPAction(email: string): Promise<AuthResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  resetOtpStore.set(cleanEmail, { otp, expiresAt });

  try {
    const { sendPasswordResetOTP } = await import("@/lib/email/mailer");
    await sendPasswordResetOTP(cleanEmail, otp);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send email OTP.";
    return { success: false, error: msg };
  }
}

// ─── Verify OTP & Set New Password Directly On Website ────────
export async function verifyOTPAndResetPasswordAction(
  email: string,
  otp: string,
  newPassword: string
): Promise<AuthResult> {
  if (!email || !otp || !newPassword) {
    return { success: false, error: "Email, OTP code, and new password are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();
  const record = resetOtpStore.get(cleanEmail);

  if (!record || record.otp !== cleanOtp) {
    return { success: false, error: "Invalid 6-digit verification code." };
  }

  if (Date.now() > record.expiresAt) {
    resetOtpStore.delete(cleanEmail);
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Update password via Supabase Admin (Service Role)
  try {
    const serviceSupabase = await createServiceSupabaseClient();
    const { data: usersList } = await serviceSupabase.auth.admin.listUsers();
    const targetUser = usersList?.users?.find(
      (u: { email?: string; id: string }) => u.email?.toLowerCase() === cleanEmail
    );

    if (targetUser) {
      const { error } = await serviceSupabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );
      if (error) {
        return { success: false, error: error.message };
      }
    }
  } catch (err) {
    console.warn("Supabase admin password update warning:", err);
  }

  // Clear used OTP
  resetOtpStore.delete(cleanEmail);
  revalidatePath("/");
  return { success: true };
}

// ─── Forgot Password (Native Supabase Auth) ──────────────────
export async function sendResetEmailAction(email: string): Promise<AuthResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const cleanEmail = email.toLowerCase().trim();
  const supabase = await createServerSupabaseClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function forgotPasswordAction(email: string): Promise<AuthResult> {
  return sendResetEmailAction(email);
}

export async function resetPasswordAction(newPassword: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
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
