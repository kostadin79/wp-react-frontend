import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Tailnews React - WordPress News App",
  description: "Modern React news application with WordPress backend",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
