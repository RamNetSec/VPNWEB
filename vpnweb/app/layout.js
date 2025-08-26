import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomThemeProvider from "../components/ThemeProvider";
import SessionWrapper from "../components/SessionWrapper";
import NoSSR from "../components/NoSSR";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VPN Admin Panel - Gestión Segura",
  description: "Panel de administración profesional para gestión de VPN con WireGuard",
  keywords: ["VPN", "WireGuard", "Administración", "Panel", "Seguridad"],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NoSSR fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>}>
          <SessionWrapper>
            <CustomThemeProvider>
              <div id="root" className="min-h-screen">
                {children}
              </div>
            </CustomThemeProvider>
          </SessionWrapper>
        </NoSSR>
      </body>
    </html>
  );
}
