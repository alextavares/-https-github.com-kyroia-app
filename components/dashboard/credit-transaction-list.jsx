"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ShoppingCart, MessageSquare, Image, Mic, Gift, RefreshCw, ChevronRight, History } from 'lucide-react';
const TransactionIcon = ({ type, description }) => {
    if (type === 'PURCHASE')
        return <ShoppingCart className="h-4 w-4 text-green-400"/>;
    if (type === 'BONUS')
        return <Gift className="h-4 w-4 text-purple-400"/>;
    if (type === 'REFUND')
        return <RefreshCw className="h-4 w-4 text-blue-400"/>;
    // For consumption, try to detect the type from description
    if (description.toLowerCase().includes('chat') || description.toLowerCase().includes('conversa')) {
        return <MessageSquare className="h-4 w-4 text-orange-400"/>;
    }
    if (description.toLowerCase().includes('imagem')) {
        return <Image className="h-4 w-4 text-blue-400"/>;
    }
    if (description.toLowerCase().includes('voz') || description.toLowerCase().includes('voice')) {
        return <Mic className="h-4 w-4 text-pink-400"/>;
    }
    return <TrendingDown className="h-4 w-4 text-red-400"/>;
};
const TransactionBadge = ({ type }) => {
    const variants = {
        PURCHASE: 'bg-green-500/10 text-green-400 border-green-500/20',
        CONSUMPTION: 'bg-red-500/10 text-red-400 border-red-500/20',
        BONUS: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        REFUND: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    const labels = {
        PURCHASE: 'Compra',
        CONSUMPTION: 'Consumo',
        BONUS: 'Bônus',
        REFUND: 'Reembolso'
    };
    return (<Badge variant="outline" className={`${variants[type]} border text-xs`}>
      {labels[type]}
    </Badge>);
};
export function CreditTransactionList() {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        var _a;
        if ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id) {
            fetchTransactions();
        }
    }, [session]);
    const fetchTransactions = async (offset = 0) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/credits/history?limit=20&offset=${offset}`);
            if (response.ok) {
                const data = await response.json();
                if (offset === 0) {
                    setTransactions(data.transactions);
                }
                else {
                    setTransactions(prev => [...prev, ...data.transactions]);
                }
                setHasMore(data.transactions.length === 20);
                setPage(Math.floor(offset / 20) + 1);
            }
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchTransactions(page * 20);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatAmount = (amount) => {
        const isPositive = amount > 0;
        return (<span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? (<TrendingUp className="h-3 w-3"/>) : (<TrendingDown className="h-3 w-3"/>)}
        {isPositive ? '+' : ''}{amount.toLocaleString('pt-BR')}
      </span>);
    };
    if (isLoading && transactions.length === 0) {
        return (<div className="space-y-4">
        {[...Array(5)].map((_, i) => (<div key={i} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-600 rounded w-16"></div>
          </div>))}
      </div>);
    }
    if (transactions.length === 0) {
        return (<div className="text-center py-12">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
        <h3 className="text-lg font-medium text-white mb-2">Nenhuma transação encontrada</h3>
        <p className="text-gray-400 mb-4">
          Suas transações de créditos aparecerão aqui conforme você usar a plataforma
        </p>
        <Button asChild variant="outline" className="text-purple-400 border-purple-500/30">
          <a href="/dashboard/credits/purchase">Comprar Créditos</a>
        </Button>
      </div>);
    }
    return (<div className="space-y-4">
      {transactions.map((transaction) => (<div key={transaction.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gray-600/50 rounded-full flex items-center justify-center">
            <TransactionIcon type={transaction.type} description={transaction.description}/>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white truncate">
                {transaction.description}
              </h4>
              <TransactionBadge type={transaction.type}/>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{formatDate(transaction.createdAt)}</span>
              {transaction.package && (<span className="text-purple-400">
                  {transaction.package.name}
                </span>)}
            </div>
          </div>
          
          {/* Amount and Balance */}
          <div className="flex-shrink-0 text-right">
            <div className="mb-1">
              {formatAmount(transaction.amount)}
            </div>
            <div className="text-xs text-gray-400">
              Saldo: {transaction.balanceAfter.toLocaleString('pt-BR')}
            </div>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors"/>
        </div>))}
      
      {/* Load More Button */}
      {hasMore && (<div className="text-center pt-4">
          <Button onClick={loadMore} disabled={isLoading} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>)}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0LXRyYW5zYWN0aW9uLWxpc3QuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlZGl0LXRyYW5zYWN0aW9uLWxpc3QudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFDTCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFlBQVksRUFDWixhQUFhLEVBQ2IsS0FBSyxFQUNMLEdBQUcsRUFDSCxJQUFJLEVBQ0osU0FBUyxFQUNULFlBQVksRUFDWixPQUFPLEVBQ1IsTUFBTSxjQUFjLENBQUE7QUFnQnJCLE1BQU0sZUFBZSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUF5QyxFQUFFLEVBQUU7SUFDdkYsSUFBSSxJQUFJLEtBQUssVUFBVTtRQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFHLENBQUE7SUFDbkYsSUFBSSxJQUFJLEtBQUssT0FBTztRQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixFQUFHLENBQUE7SUFDekUsSUFBSSxJQUFJLEtBQUssUUFBUTtRQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFHLENBQUE7SUFFN0UsMkRBQTJEO0lBQzNELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDakcsT0FBTyxDQUFDLGFB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