"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from '@/components/ui/sidebar';
import { MessageSquare, FileText, LogOut, Home, Briefcase, GraduationCap, Library, Sparkles, ChevronDown, Headphones, BookOpen, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';
import { CreditBalance } from '@/components/dashboard/credit-balance';
const menuItems = [
    {
        title: 'Início',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Chat',
        href: '/dashboard/chat',
        icon: MessageSquare,
    },
    {
        title: 'Templates',
        href: '/dashboard/templates',
        icon: FileText,
    },
    {
        title: 'Base de Conhecimento',
        href: '/dashboard/knowledge',
        icon: BookOpen,
    },
    {
        title: 'Cursos',
        href: '/dashboard/courses',
        icon: GraduationCap,
    },
    {
        title: 'Ferramentas',
        href: '/dashboard/tools',
        icon: Briefcase,
    },
    {
        title: 'Biblioteca',
        href: '/dashboard/library',
        icon: Library,
        hasDropdown: true,
    },
];
export function DashboardSidebar() {
    var _a, _b, _c, _d;
    const pathname = usePathname();
    const { data: session } = useSession();
    const [userPlan, setUserPlan] = useState('FREE');
    // Load user plan
    useEffect(() => {
        const fetchUserPlan = async () => {
            if (session === null || session === void 0 ? void 0 : session.user) {
                try {
                    const response = await fetch('/api/subscription');
                    if (response.ok) {
                        const data = await response.json();
                        setUserPlan(data.planType || 'FREE');
                    }
                }
                catch (error) {
                    console.error('Error fetching user plan:', error);
                }
            }
        };
        fetchUserPlan();
    }, [(_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id]);
    return (<Sidebar className="w-[280px] border-r-0 hide-scrollbar sidebar-dark bg-gray-900 text-white" style={{
            backgroundColor: '#111827',
            color: 'white',
            minHeight: '100vh'
        }}>
      <SidebarHeader className="p-4" style={{ backgroundColor: '#111827' }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-xl font-bold text-purple-400">AI</span>
          </div>
          <span className="text-xl font-semibold text-white">Kyroia</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3 hide-scrollbar" style={{ backgroundColor: '#111827', color: 'white' }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (<SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="h-12 rounded-xl hover:bg-gray-800/50 data-[active=true]:bg-gray-800 text-gray-300 hover:text-white data-[active=true]:text-white">
                    <Link href={item.href} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5"/>
                      <span className="text-base">{item.title}</span>
                      {item.hasDropdown && (<ChevronDown className="h-4 w-4 ml-auto"/>)}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Credit Balance Section */}
        <div className="mx-3 mb-4">
          <CreditBalance />
        </div>

        {/* Upgrade Section */}
        <div className="mt-auto mb-4 mx-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-2xl text-white">
            <h3 className="font-semibold mb-1">Você está no plano {userPlan === 'FREE' ? 'Free' : userPlan}</h3>
            <p className="text-sm opacity-90 mb-3">
              Faça upgrade para desbloquear funcionalidades disponíveis
            </p>
            <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0">
              <Link href="/dashboard/subscription">
                <Sparkles className="h-4 w-4 mr-2"/>
                Fazer upgrade
              </Link>
            </Button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-gray-800" style={{ backgroundColor: '#111827', color: 'white' }}>
        <div className="space-y-2">
          <SidebarMenuButton asChild className="h-12 rounded-xl hover:bg-gray-800/50 justify-start text-gray-300 hover:text-white">
            <Link href="/support" className="flex items-center gap-3 px-3">
              <Headphones className="h-5 w-5"/>
              <span className="text-base">Suporte</span>
            </Link>
          </SidebarMenuButton>
          
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-500/20 text-purple-400">
                {((_c = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c[0]) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium truncate text-white">
                {((_d = session === null || session === void 0 ? void 0 : session.user) === null || _d === void 0 ? void 0 : _d.name) || 'Usuário'}
              </p>
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                {userPlan}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-400">
              <LogOut className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaWRlYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLElBQUksTUFBTSxXQUFXLENBQUE7QUFDNUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBZSxNQUFNLE9BQU8sQ0FBQTtBQUN4RCxPQUFPLEVBQ0wsT0FBTyxFQUNQLGNBQWMsRUFDZCxhQUFhLEVBQ2IsWUFBWSxFQUNaLG1CQUFtQixFQUVuQixhQUFhLEVBQ2IsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixlQUFlLEdBRWhCLE1BQU0seUJBQXlCLENBQUE7QUFDaEMsT0FBTyxFQUNMLGFBQWEsRUFJYixRQUFRLEVBSVIsTUFBTSxFQUNOLElBQUksRUFDSixTQUFTLEVBQ1QsYUFBYSxFQUNiLE9BQU8sRUFDUCxRQUFRLEVBQ1IsV0FBVyxFQUNYLFVBQVUsRUFDVixRQUFRLEdBQ1QsTUFBTSxjQUFjLENBQUE7QUFDckIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0QsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFFckUsTUFBTSxTQUFTLEdBQUc7SUFDaEI7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxJQUFJO0tBQ1g7SUFDRDtRQUNFLEtBQUssRUFBRSxNQUFNO1FBQ2Is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