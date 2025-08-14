"use client";
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
export function DashboardHeader({ user }) {
    var _a, _b;
    const userInitials = ((_a = user.name) === null || _a === void 0 ? void 0 : _a.split(' ').map((n) => n[0]).join('').toUpperCase()) || ((_b = user.email) === null || _b === void 0 ? void 0 : _b[0].toUpperCase()) || 'U';
    const planType = user.planType || 'FREE';
    const planColor = planType === 'PRO' ? 'default' : planType === 'PREMIUM' ? 'secondary' : 'outline';
    return (<header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-3">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gray-400 hover:text-white"/>
        <div>
          <h2 className="text-lg font-semibold text-white">Bem-vindo de volta!</h2>
          <p className="text-sm text-gray-400">
            Gerencie suas conversas e configurações
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={planColor} className="bg-purple-600 text-white border-purple-500">
          Plano {planType}
        </Badge>

        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-gray-800">
          <Bell className="h-5 w-5"/>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-purple-500"/>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-800">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} alt={user.name || ''}/>
                <AvatarFallback className="bg-purple-500/20 text-purple-400">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                <p className="text-xs leading-none text-gray-400">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700"/>
            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
              <Link href="/dashboard/profile">
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4"/>
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700"/>
            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4"/>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlYWRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBR1osT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQzVFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQ0wsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLHFCQUFxQixFQUNyQixtQkFBbUIsR0FDcEIsTUFBTSwrQkFBK0IsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxXQUFXLENBQUE7QUFNNUIsTUFBTSxVQUFVLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBd0I7O0lBQzVELE1BQU0sWUFBWSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FDMUIsS0FBSyxDQUFDLEdBQUcsRUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDZixJQUFJLENBQUMsRUFBRSxFQUNQLFdBQVcsRUFBRSxNQUFJLE1BQUEsSUFBSSxDQUFDLEtBQUssMENBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFBLElBQUksR0FBRyxDQUFBO0lBRXhELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFBO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLFFBQVEs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