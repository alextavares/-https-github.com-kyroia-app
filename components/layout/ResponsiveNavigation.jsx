'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home, MessageSquare, Settings, CreditCard, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
const publicNavItems = [
    { href: '/', label: 'Início', icon: Home, description: 'Página inicial' },
    { href: '/pricing', label: 'Preços', icon: CreditCard, description: 'Planos e preços' },
    { href: '/demo-chat', label: 'Demo', icon: MessageSquare, description: 'Experimente grátis' },
];
const dashboardNavItems = [
    { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare, description: 'Conversar com IA' },
    { href: '/dashboard/knowledge', label: 'Conhecimento', icon: BookOpen, description: 'Base de conhecimento' },
    { href: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard, description: 'Gerenciar plano' },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings, description: 'Configurações da conta' },
    { href: '/dashboard/profile', label: 'Perfil', icon: User, description: 'Perfil do usuário' },
];
export function ResponsiveNavigation({ items = publicNavItems, className, showMobileMenu = true }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const NavItems = ({ mobile = false }) => (<nav className={cn("flex gap-1", mobile ? "flex-col space-y-2" : "flex-row")} role="navigation" aria-label={mobile ? "Menu de navegação móvel" : "Menu de navegação principal"}>
      {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (<Link key={item.href} href={item.href} onClick={() => mobile && setIsOpen(false)} className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors", "hover:bg-accent hover:text-accent-foreground", "focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring", isActive && "bg-accent text-accent-foreground", mobile && "w-full justify-start")} aria-current={isActive ? "page" : undefined} aria-describedby={mobile ? `${item.href}-description` : undefined}>
            <Icon className="h-4 w-4" aria-hidden="true"/>
            {item.label}
            {mobile && item.description && (<span id={`${item.href}-description`} className="sr-only">
                {item.description}
              </span>)}
          </Link>);
        })}
    </nav>);
    return (<div className={cn("flex items-center", className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <NavItems />
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (<div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu de navegação" aria-expanded={isOpen} aria-controls="mobile-navigation">
                <Menu className="h-5 w-5"/>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]" id="mobile-navigation">
              <SheetHeader>
                <SheetTitle className="text-left">Menu de Navegação</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavItems mobile/>
              </div>
            </SheetContent>
          </Sheet>
        </div>)}
    </div>);
}
// Responsive container with proper breakpoints
export function ResponsiveContainer({ children, className, maxWidth = "7xl" }) {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        full: "max-w-full"
    };
    return (<div className={cn("mx-auto px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth], className)}>
      {children}
    </div>);
}
// Responsive grid with proper breakpoints
export function ResponsiveGrid({ children, className, cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4
} }) {
    const gridClasses = [
        cols.default && `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
    ].filter(Boolean).join(' ');
    return (<div className={cn("grid gap-4 sm:gap-6", gridClasses, className)}>
      {children}
    </div>);
}
export { dashboardNavItems, publicNavItems };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzcG9uc2l2ZU5hdmlnYXRpb24uanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUmVzcG9uc2l2ZU5hdmlnYXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDaEMsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFBO0FBQzVCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNsRyxPQUFPLEVBQUUsSUFBSSxFQUFLLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ2pHLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFTaEMsTUFBTSxjQUFjLEdBQXFCO0lBQ3ZDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFO0lBQ3pFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFO0lBQ3ZGLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFFO0NBQzlGLENBQUE7QUFFRCxNQUFNLGlCQUFpQixHQUFxQjtJQUMxQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUs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
