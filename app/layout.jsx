// import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/theme-context";
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });
export const metadata = {
    title: "Kyroia",
    description: "Clone da plataforma Kyroia com múltiplos provedores de IA",
};
export default function RootLayout({ children, }) {
    return (<html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <SessionProviderWrapper>
            {children}
            <Toaster />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxheW91dC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsNENBQTRDO0FBQzVDLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sc0JBQXNCLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV6RCx3QkFBd0I7QUFDeEIsd0JBQXdCO0FBQ3hCLDhCQUE4QjtBQUM5QixNQUFNO0FBRU4sTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFhO0lBQ2hDLEtBQUssRUFBRSxnQkFBZ0I7SUFDdkIsV0FBVyxFQUFFLDZEQUE2RDtDQUMzRSxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sVUFBVSxVQUFVLENBQUMsRUFDakMsUUFBUSxHQUdSO0lBQ0EsT0FBTyxDQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQ3pDO01BQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUNyQztRQUFBLENBQUMsYUFBYSxDQUNaO1VBQUEsQ0FBQyxzQkFBc0IsQ0FDckI7WUFBQSxDQUFDLFFBQVEsQ0FDVDtZQUFBLENBQUMsT0FBTyxDQUFDLEFBQUQsRUFDVjtVQUFBLEVBQUUsc0JBQXNCLENBQzFCO1FBQUEsRUFBRSxhQUFhLENBQ2pCO01BQUEsRUFBRSxJQUFJLENBQ1I7SUFBQSxFQUFFLElBQUksQ0FBQyxDQUNSLENBQUM7QUFDSixDQUFDIn0=