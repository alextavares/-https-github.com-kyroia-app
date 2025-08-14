"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingDown, ShoppingCart } from 'lucide-react';
export function CreditStats() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        currentBalance: 0,
        totalConsumed: 0,
        totalPurchased: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        var _a;
        if ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id) {
            fetchStats();
        }
    }, [session]);
    const fetchStats = async () => {
        try {
            // For now, we'll use the balance endpoint and simulate other stats
            const response = await fetch('/api/credits/balance');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    currentBalance: data.balance,
                    totalConsumed: 0, // TODO: Implement in backend
                    totalPurchased: 0 // TODO: Implement in backend
                });
            }
        }
        catch (error) {
            console.error('Error fetching credit stats:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const StatCard = ({ title, value, description, icon: Icon, color }) => (<Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`}/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {isLoading ? (<div className="w-16 h-6 bg-gray-600 rounded animate-pulse"></div>) : (value.toLocaleString('pt-BR'))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>);
    return (<>
      <StatCard title="Saldo Atual" value={stats.currentBalance} description="Créditos disponíveis" icon={Coins} color="text-purple-400"/>
      
      <StatCard title="Total Consumido" value={stats.totalConsumed} description="Créditos utilizados" icon={TrendingDown} color="text-red-400"/>
      
      <StatCard title="Total Comprado" value={stats.totalPurchased} description="Créditos adquiridos" icon={ShoppingCart} color="text-green-400"/>
    </>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0LXN0YXRzLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWRpdC1zdGF0cy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFtQixVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDaEcsT0FBTyxFQUNMLEtBQUssRUFFTCxZQUFZLEVBQ1osWUFBWSxFQUViLE1BQU0sY0FBYyxDQUFBO0FBUXJCLE1BQU0sVUFBVSxXQUFXO0lBQ3pCLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUE7SUFDdEMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQWM7UUFDOUMsY0FBYyxFQUFFLENBQUM7UUFDakIsYUFBYSxFQUFFLENBQUM7UUFDaEIsY0FBYyxFQUFFLENBQUM7S0FDbEIsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFaEQsU0FBUyxDQUFDLEdBQUcsRUFBRTs7UUFDYixJQUFJLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksMENBQUUsRUFBRSxFQUFFLENBQUM7WUFDdEIsVUFBVSxFQUFFLENBQUE7UUFDZCxDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUViLE1BQU0sVUFBVSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQzVCLElBQUksQ0FBQztZQUNILG1FQUFtRTtZQUNuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1lBQ3BELElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtnQkFDbEMsUUFBUSxDQUFDO29CQUNQLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDNUIsYUFBYSxFQUFFLENBQUMsRUFBRSw2QkFBNkI7b0JBQy9DLGNBQWMsRUFBRSxDQUFDLENBQUUsNkJBQTZCO2lCQUNqRCxDQUFDLENBQUE7WUFDSixDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3RELENBQUM7Z0JBQVMsQ0FBQztZQUNULFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQixDQUFDO0lBQ0gsQ0FBQyxDQUFBO0lBRUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxFQUNoQixLQUFLLEVBQ0wsS0FBSyxFQUNMLFdBQVcsRUFDWCxJQUFJLEVBQUUsSUFBSSxFQUNWLEtBQUssRUFPTixFQUFFLEVBQUUsQ0FBQyxDQUNKLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FDOUM7TUFBQSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsMkRBQTJELENBQy9FO1FBQUEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUMzRTtRQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsS0FBSyxFQUFFLENBQUMsRUFDdEM7TUFBQSxFQUFFLFVBQVUsQ0FDWjtNQUFBLENBQUMsV0FBVyxDQUNWO1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUM1QztVQUFBLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNYLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw0Q0FBNEMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUNuRSxDQUFDLENBQUMsQ0FBQyxDQUNGLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQzlCLENBQ0g7UUFBQSxFQUFFLEdBQUcsQ0FDTDtRQUFBLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FDNUQ7TUFBQSxFQUFFLFdBQVcsQ0FDZjtJQUFBLEVBQUUsSUFBSSxDQUFDLENBQ1IsQ0FBQTtJQUVELE9BQU8sQ0FDTCxFQUNFO01BQUEsQ0FBQyxRQUFRLENBQ1AsS0FBSyxDQUFDLGFBQWEsQ0FDbkIsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUM1QixXQUFXLENBQUMsc0JBQXNCLENBQ2xDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNaLEtBQUssQ0FBQyxpQkFBaUIsRUFHekI7O01BQUEsQ0FBQyxRQUFRLENBQ1AsS0FBSyxDQUFDLGlCQUFpQixDQUN2QixLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQzNCLFdBQVcsQ0FBQyxxQkFBcUIsQ0FDakMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQ25CLEtBQUssQ0FBQyxjQUFjLEVBR3RCOztNQUFBLENBQUMsUUFBUSxDQUNQLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDdEIsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUM1QixXQUFXLENBQUMscUJBQXFCLENBQ2pDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUNuQixLQUFLLENBQUMsZ0JBQWdCLEVBRTFCO0lBQUEsR0FBRyxDQUNKLENBQUE7QUFDSCxDQUFDIn0=