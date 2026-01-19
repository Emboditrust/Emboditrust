import type { Metadata } from "next";

// @ts-ignore
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthSessionProvider } from "@/providers/session-provider";



export const metadata: Metadata = {
  title: "EmbodiTrust - Pharmaceutical Anti-Counterfeiting System",
  description: "Comprehensive solution to combat counterfeit pharmaceuticals in Nigeria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body">
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <ToastProvider />
            </QueryProvider>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}