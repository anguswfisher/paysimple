import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "PaySimple - AI-Powered Construction Payment Scheduling",
  description: "Automatically extract payment terms from construction contracts and generate compliant payment schedules with retainage calculations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-warm-white text-slate">
        <TooltipProvider>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
