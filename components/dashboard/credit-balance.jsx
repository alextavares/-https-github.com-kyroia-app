"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Coins, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
export function CreditBalance({ className }) {
    const { data: session } = useSession();
    const [creditBalance, setCreditBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLowBalance, setIsLowBalance] = useState(false);
    useEffect(() => {
        var _a;
        if ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id) {
            fetchCreditBalance();
        }
    }, [session]);
    const fetchCreditBalance = async () => {
        try {
            const response = await fetch('/api/credits/balance');
            if (response.ok) {
                const data = await response.json();
                setCreditBalance(data.balance);
                setIsLowBalance(data.balance < 100); // Low balance threshold
            }
        }
        catch (error) {
            console.error('Error fetching credit balance:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return (<div className={`flex items-center justify-center p-3 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
      </div>);
    }
    return (<div className={`space-y-3 ${className}`}>
      {/* Credit Balance Display */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Coins className="h-4 w-4 text-purple-400"/>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Créditos</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold text-purple-400">
                {creditBalance.toLocaleString('pt-BR')}
              </span>
              {isLowBalance && (<AlertCircle className="h-4 w-4 text-yellow-400"/>)}
            </div>
          </div>
        </div>
      </div>

      {/* Low Balance Warning */}
      {isLowBalance && (<div className="px-3 py-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-400"/>
            <p className="text-xs text-yellow-300">
              Saldo baixo! Adicione créditos para continuar usando todas as funcionalidades.
            </p>
          </div>
        </div>)}

      {/* Add Credits Button */}
      <Button asChild variant="outline" className="w-full bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200">
        <Link href="/dashboard/credits/purchase" className="flex items-center gap-2">
          <Plus className="h-4 w-4"/>
          Adicionar Créditos
        </Link>
      </Button>

      {/* Credit History Link */}
      <Link href="/dashboard/credits/history" className="block text-center text-xs text-gray-400 hover:text-purple-400 transition-colors">
        Ver histórico de créditos
      </Link>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0LWJhbGFuY2UuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlZGl0LWJhbGFuY2UudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ3ZELE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQTtBQU01QixNQUFNLFVBQVUsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFzQjtJQUM3RCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLFVBQVUsRUFBRSxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxRQUFRLENBQVMsQ0FBQyxDQUFDLENBQUE7SUFDN0QsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEQsTUFBTSxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFdkQsU0FBUyxDQUFDLEdBQUcsRUFBRTs7UUFDYixJQUFJLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksMENBQUUsRUFBRSxFQUFFLENBQUM7WUFDdEIsa0JBQWtCLEVBQUUsQ0FBQTtRQUN0QixDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUViLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDcEMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcs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