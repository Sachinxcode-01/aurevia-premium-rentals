import { Metadata } from "next";
import BookingReturnClient from "./BookingReturnClient";

export const metadata: Metadata = {
  title: "Aurevia | Studio Return & Diagnostic Terminal",
  description: "Equipment Return, Diagnostic Inspection & Inventory Release Terminal.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ReturnBookingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReturnBookingPage({ searchParams }: ReturnBookingPageProps) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : "";

  return <BookingReturnClient initialRef={ref} />;
}
