import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Happy Loop - Gamified Habit Building for Kids",
  description: "Help your children build positive habits through fun, gamification, and rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
