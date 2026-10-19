import { Metadata } from "next";
import LicensesClient from "@/components/pages/LicensesClient";

export const metadata: Metadata = {
  title: "Open-Source Licences & Software Acknowledgements | AUREVIA",
  description:
    "Open-source software licenses, third-party component acknowledgements, and copyright notices for AUREVIA Premium Rentals.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/licenses",
  },
  openGraph: {
    title: "Open-Source Licences | AUREVIA Camera Rentals",
    description: "Third-party software notices and open-source licenses powering AUREVIA.",
    url: "https://aurevia-premium-rentals.vercel.app/licenses",
    siteName: "AUREVIA Premium Rentals",
    type: "website",
  },
};

export default function LicensesPage() {
  return <LicensesClient />;
}
