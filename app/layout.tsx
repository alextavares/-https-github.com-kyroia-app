import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "InnerAI Clone",
  description: "Clone da plataforma InnerAI com múltiplos provedores de IA",
  other: {
    "google-fonts": "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-dm-sans antialiased">
        <ThemeProvider>
          <SessionProviderWrapper>
            {children}
            <Toaster />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
