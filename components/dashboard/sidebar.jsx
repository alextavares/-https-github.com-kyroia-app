"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  LogOut,
  Home,
  Briefcase,
  GraduationCap,
  Library,
  Sparkles,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';
import { CreditBalance } from '@/components/dashboard/credit-balance';

const menuItems = [
  { title: 'Início', href: '/dashboard', icon: Home },
  { title: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { title: 'Base de Conhecimento', href: '/dashboard/knowledge', icon: BookOpen },
  { title: 'Cursos', href: '/dashboard/courses', icon: GraduationCap },
  { title: 'Ferramentas', href: '/dashboard/tools', icon: Briefcase },
  { title: 'Biblioteca', href: '/dashboard/library', icon: Library, hasDropdown: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState('FREE');

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/subscription');
          if (response.ok) {
            const data = await response.json();
            setUserPlan(data.planType || 'FREE');
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
        }
      }
    };
    fetchUserPlan();
  }, [session?.user?.id]);

  return (
    <Sidebar
      collapsible="icon"
      className="hide-scrollbar border-r border-border bg-background text-foreground"
      style={{ minHeight: '100vh', ['--sidebar-width']: '18rem', ['--sidebar-width-icon']: '3.25rem' }}
    >
      <SidebarRail />

      <SidebarHeader className="px-4 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Kyroia</span>
          </Link>
          <SidebarTrigger className="hidden md:inline-flex" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 hide-scrollbar bg-background text-foreground">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.title, className: 'rounded-md text-xs' }}
                    className="h-14 rounded-xl border transition-all duration-300 ease-out hover:bg-muted/70 data-[active=true]:bg-[var(--sidebar-active-bg)] data-[active=true]:border-primary/40 data-[active=true]:ring-1 data-[active=true]:ring-primary/30 data-[active=true]:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                    <Link href={item.href} className="flex items-center gap-4 px-4">
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 transition-transform duration-300 group-hover:scale-105" />
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                      {item.hasDropdown && (<ChevronDown className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />)}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 mb-4 group-data-[collapsible=icon]:hidden">
          <CreditBalance />
        </div>

        <div className="mt-auto mb-6 mx-4 group-data-[collapsible=icon]:hidden">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-violet-900/20 dark:to-fuchsia-900/10 border border-purple-200/60 dark:border-purple-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium text-purple-700">Plano {userPlan === 'FREE' ? 'Free' : userPlan}</span>
            </div>
            <p className="text-sm text-purple-600 mb-3">Desbloqueie todo o potencial da IA</p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-xl h-9">
              <Link href="/dashboard/subscription">
                <Sparkles className="h-4 w-4 mr-2" />Upgrade
              </Link>
            </Button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border bg-background text-foreground">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                {(session?.user && (session.user.name || '').charAt(0)) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate">{session?.user?.name || 'Usuário'}</p>
              <Badge variant="outline" className="text-xs">{userPlan}</Badge>
            </div>
            <div className="ml-auto group-data-[collapsible=icon]:ml-0">
              <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-8 w-8 rounded-lg hover:bg-muted" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaWRlYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLElBQUksTUFBTSxXQUFXLENBQUE7QUFDNUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBZSxNQUFNLE9BQU8sQ0FBQTtBQUN4RCxPQUFPLEVBQ0wsT0FBTyxFQUNQLGNBQWMsRUFDZCxhQUFhLEVBQ2IsWUFBWSxFQUNaLG1CQUFtQixFQUVuQixhQUFhLEVBQ2IsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixlQUFlLEdBRWhCLE1BQU0seUJBQXlCLENBQUE7QUFDaEMsT0FBTyxFQUNMLGFBQWEsRUFJYixRQUFRLEVBSVIsTUFBTSxFQUNOLElBQUksRUFDSixTQUFTLEVBQ1QsYUFBYSxFQUNiLE9BQU8sRUFDUCxRQUFRLEVBQ1IsV0FBVyxFQUNYLFVBQVUsRUFDVixRQUFRLEdBQ1QsTUFBTSxjQUFjLENBQUE7QUFDckIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0QsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFFckUsTUFBTSxTQUFTLEdBQUc7SUFDaEI7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxJQUFJO0tBQ1g7SUFDRDtRQUNFLEtBQUssRUFBRSxNQUFNO1FBQ2Is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
