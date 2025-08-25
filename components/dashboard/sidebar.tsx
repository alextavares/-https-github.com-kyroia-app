"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  CreditCard,
  FileText,
  Brain,
  History,
  User,
  LogOut,
  Home,
  Briefcase,
  GraduationCap,
  Library,
  Sparkles,
  ChevronDown,
  Headphones,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'
import { CreditBalance } from '@/components/dashboard/credit-balance'

// Menu mais limpo: manter apenas o essencial
const primaryItems = [
  {
    title: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
    description: 'Converse com IA',
  },
]

const accountItems = [
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Perfil e preferências',
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userPlan, setUserPlan] = useState('FREE')
  
  // Load user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/subscription')
          if (response.ok) {
            const data = await response.json()
            setUserPlan(data.planType || 'FREE')
          }
        } catch (error) {
          console.error('Error fetching user plan:', error)
        }
      }
    }
    fetchUserPlan()
  }, [session?.user?.id])

  return (
    <Sidebar
      collapsible="icon"
      className="hide-scrollbar border-r border-border bg-background text-foreground"
      style={{
        minHeight: '100vh',
        ['--sidebar-width' as any]: '16rem',
        ['--sidebar-width-icon' as any]: '3rem',
        ['--sidebar-active-bg' as any]: 'hsl(var(--primary) / 0.08)',
      }}
    >
      {/* Rail clicável para colapsar/expandir (desktop) */}
      <SidebarRail />

      <SidebarHeader className="px-3 py-3 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Kyroia</span>
          </Link>
          {/* Botão de colapso para desktop */}
          <SidebarTrigger className="hidden md:inline-flex" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-5 hide-scrollbar bg-background text-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.title, className: 'rounded-md text-xs' }}
                    className="h-12 rounded-lg border transition-all duration-300 ease-out hover:bg-muted/60 data-[active=true]:bg-[var(--sidebar-active-bg)] data-[active=true]:border-primary/40 data-[active=true]:ring-1 data-[active=true]:ring-primary/20 data-[active=true]:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 transition-transform duration-300 group-hover:scale-105 flex-shrink-0" />
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground">Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.title, className: 'rounded-md text-xs' }}
                    className="h-12 rounded-lg border transition-all duration-300 ease-out hover:bg-muted/60 data-[active=true]:bg-[var(--sidebar-active-bg)] data-[active=true]:border-primary/40 data-[active=true]:ring-1 data-[active=true]:ring-primary/20 data-[active=true]:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 transition-transform duration-300 group-hover:scale-105 flex-shrink-0" />
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seções de créditos/upgrade ocultadas para um layout mais limpo */}
      </SidebarContent>

      <SidebarFooter 
        className="p-3 border-t border-border bg-background text-foreground"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                {session?.user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || 'Usuário'}
              </p>
              <Badge variant="outline" className="text-xs">
                {userPlan}
              </Badge>
            </div>
            <div className="ml-auto group-data-[collapsible=icon]:ml-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8 rounded-lg hover:bg-muted"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
