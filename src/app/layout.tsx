import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nurse Scheduler",
  description: "Sistema de gestión de turnos automatizado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
