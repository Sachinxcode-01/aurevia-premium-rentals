import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a strong, new password for your AUREVIA account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
