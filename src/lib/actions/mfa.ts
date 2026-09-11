"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

export interface MFAEnrollResult {
  success: boolean;
  factorId?: string;
  secret?: string;
  qrCodeUrl?: string;
  uri?: string;
  error?: string;
}

export interface MFAVerifyResult {
  success: boolean;
  error?: string;
}

export interface MFAStatusResult {
  success: boolean;
  isEnabled: boolean;
  factors: Array<{
    id: string;
    friendlyName?: string;
    factorType: string;
    status: string;
    createdAt: string;
  }>;
  currentLevel: string;
  nextLevel: string;
  error?: string;
}

/**
 * Initiates TOTP MFA enrollment for the currently signed-in user.
 * Generates a standard RFC 6238 TOTP secret and scannable QR code.
 */
export async function enrollMFAAction(): Promise<MFAEnrollResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required to configure MFA." };
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "AUREVIA Premium Rentals",
      friendlyName: `AUREVIA (${user.email})`,
    });

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to initialize authenticator factor." };
    }

    // Generate scannable QR Code Data URL
    const qrCodeUrl = await QRCode.toDataURL(data.totp.uri, {
      margin: 2,
      width: 256,
      color: {
        dark: "#0F0F11",
        light: "#FFFFFF",
      },
    });

    return {
      success: true,
      factorId: data.id,
      secret: data.totp.secret,
      qrCodeUrl,
      uri: data.totp.uri,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error during MFA enrollment.";
    return { success: false, error: msg };
  }
}

/**
 * Verifies the first 6-digit TOTP code after enrollment to permanently activate MFA.
 */
export async function verifyMFAEnrollmentAction(
  factorId: string,
  code: string
): Promise<MFAVerifyResult> {
  try {
    if (!factorId || !code || code.trim().length !== 6) {
      return { success: false, error: "A valid 6-digit authentication code is required." };
    }

    const cleanCode = code.trim();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode,
    });

    if (error) {
      return { success: false, error: error.message || "Invalid or expired verification code." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error verifying authenticator setup.";
    return { success: false, error: msg };
  }
}

/**
 * Challenges and verifies TOTP code during sign-in to elevate session to AAL2.
 */
export async function challengeAndVerifyMFAAction(
  factorId: string,
  code: string
): Promise<MFAVerifyResult> {
  try {
    if (!factorId || !code || code.trim().length !== 6) {
      return { success: false, error: "A valid 6-digit authentication code is required." };
    }

    const cleanCode = code.trim();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("incorrect")) {
        return { success: false, error: "Incorrect authentication code. Please check your authenticator app." };
      }
      if (msg.includes("expired")) {
        return { success: false, error: "Verification code expired. Please enter the current code." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error verifying authentication code.";
    return { success: false, error: msg };
  }
}

/**
 * Returns the current MFA status, active factors, and assurance level for the signed-in user.
 */
export async function getMFAStatusAction(): Promise<MFAStatusResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        isEnabled: false,
        factors: [],
        currentLevel: "aal1",
        nextLevel: "aal1",
        error: "Not authenticated.",
      };
    }

    const [factorsRes, aalRes] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    const factors = factorsRes.data?.all || [];
    const verifiedFactors = factors.filter((f: { status?: string }) => f.status === "verified");
    const isEnabled = verifiedFactors.length > 0;

    return {
      success: true,
      isEnabled,
      factors: factors.map((f: { id: string; friendly_name?: string; factor_type: string; status: string; created_at: string }) => ({
        id: f.id,
        friendlyName: f.friendly_name || undefined,
        factorType: f.factor_type,
        status: f.status,
        createdAt: f.created_at,
      })),
      currentLevel: aalRes.data?.currentLevel || "aal1",
      nextLevel: aalRes.data?.nextLevel || "aal1",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve MFA status.";
    return {
      success: false,
      isEnabled: false,
      factors: [],
      currentLevel: "aal1",
      nextLevel: "aal1",
      error: msg,
    };
  }
}

/**
 * Unenrolls/disables an active TOTP MFA factor.
 */
export async function unenrollMFAAction(factorId: string): Promise<MFAVerifyResult> {
  try {
    if (!factorId) {
      return { success: false, error: "Factor ID is required." };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to disable MFA factor.";
    return { success: false, error: msg };
  }
}
