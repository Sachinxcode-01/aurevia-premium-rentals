import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password Recovery",
  description: "Reset your AUREVIA rental account password securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
