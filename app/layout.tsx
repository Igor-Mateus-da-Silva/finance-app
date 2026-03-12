import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/AppLayout";
import { DataFetcher } from "@/components/DataFetcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Controle Financeiro Pessoal",
  description: "Aplicativo de controle financeiro pessoal e planejamento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <DataFetcher />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-background text-foreground">
            <AppLayout>{children}</AppLayout>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
