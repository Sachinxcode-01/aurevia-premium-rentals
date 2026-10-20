import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to AUREVIA Vault",
  description: "Access your AUREVIA cinema camera rental account, manage active bookings, and review rental agreements.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
