import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/component/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VitalMonitor.ai | Monitoramento Clínico Inteligente",
  description: "Plataforma de gestão hospitalar IoT com análise preditiva em tempo real.",
  icons: {
    icon: "/favicon.ico", // Certifique-se de ter um ícone se quiser
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased 
          bg-[#F1F5F9] text-[#1E293B] 
          selection:bg-[#06B6D4] selection:text-white
        `}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}