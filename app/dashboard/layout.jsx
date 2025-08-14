import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import UsageIndicator from '@/components/usage/usage-indicator';
export default async function DashboardLayout({ children, }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/auth/signin');
    }
    return (<SidebarProvider defaultOpen={true}>
      <div className="flex h-screen overflow-hidden bg-black">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-black hide-scrollbar">
            <div className="w-full max-w-none px-4 lg:px-6">
              {/* Indicador mínimo de uso – só aparece perto do limite */}
              <div className="pt-3 pb-2">
                {/* @ts-expect-error Server/Client boundary – componente client-safe */}
                <UsageIndicator variant="minimal"/>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxheW91dC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3hDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUN6RCxPQUFPLGNBQWMsTUFBTSxvQ0FBb0MsQ0FBQTtBQUUvRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxlQUFlLENBQUMsRUFDNUMsUUFBUSxHQUdUO0lBQ0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUVuRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDYixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVELE9BQU8sQ0FDTCxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDakM7TUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsd0NBQXdDLENBQ3JEO1FBQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxBQUFELEVBQ2pCO1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxDQUNuRDtVQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnREFBZ0QsQ0FDOUQ7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0NBQWdDLENBQzdDO2NBQUEsQ0FBQywwREFBMEQsQ0FDM0Q7Y0FBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtnQkFBQSxDQUFDLHNFQUFzRSxDQUN2RTtnQkFBQSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUNuQztjQUFBLEVBQUUsR0FBRyxDQUNMO2NBQUEsQ0FBQyxRQUFRLENBQ1g7WUFBQSxFQUFFLEdBQUcsQ0FDUDtVQUFBLEVBQUUsSUFBSSxDQUNSO1FBQUEsRUFBRSxHQUFHLENBQ1A7TUFBQSxFQUFFLEdBQUcsQ0FDUDtJQUFBLEVBQUUsZUFBZSxDQUFDLENBQ25CLENBQUE7QUFDSCxDQUFDIn0=