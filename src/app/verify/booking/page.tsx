import { Metadata } from "next";
import BookingVerifyClient from "./BookingVerifyClient";

export const metadata: Metadata = {
  title: "Aurevia | Studio Counter Dispatch Terminal",
  description: "Secure QR Code & Handover OTP Verification Terminal for Studio Equipment Release.",
  robots: {
    index: false,
    follow: false,
  },
};

interface VerifyBookingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyBookingPage({ searchParams }: VerifyBookingPageProps) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : "";
  const otp = typeof params.otp === "string" ? params.otp : "";

  return <BookingVerifyClient initialRef={ref} initialOtp={otp} />;
}
