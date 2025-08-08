import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientNavbar from "./ClientNavbar";
import { CartProvider } from "./CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deliciosa Comida - Tienda Online",
  description: "Los mejores sabores de la ciudad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geistSans.variable}>
        <CartProvider>
          <ClientNavbar />
          <main style={{ paddingTop: "70px" }}>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
