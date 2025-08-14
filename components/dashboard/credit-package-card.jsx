"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Star, Loader2 } from 'lucide-react';
export function CreditPackageCard({ credits, price, originalPrice, discount, isPopular = false, features }) {
    const [isLoading, setIsLoading] = useState(false);
    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement purchase logic
            const response = await fetch('/api/credits/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credits,
                    price
                })
            });
            if (response.ok) {
                const data = await response.json();
                // Redirect to payment or success page
                window.location.href = data.paymentUrl || '/dashboard/credits/success';
            }
            else {
                throw new Error('Failed to initiate purchase');
            }
        }
        catch (error) {
            console.error('Purchase error:', error);
            // Show error message to user
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<Card className={`relative transition-all duration-200 hover:shadow-lg ${isPopular
            ? 'border-purple-500/50 bg-purple-900/10 scale-105'
            : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/30'}`}>
      {isPopular && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 text-white px-3 py-1 flex items-center gap-1">
            <Star className="h-3 w-3"/>
            Mais Popular
          </Badge>
        </div>)}
      
      {discount && (<div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="bg-green-500 text-white">
            {discount}% OFF
          </Badge>
        </div>)}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-5 w-5 text-purple-400"/>
          <CardTitle className="text-xl font-bold text-white">
            {credits.toLocaleString('pt-BR')} créditos
          </CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">
              R$ {price.toFixed(2)}
            </span>
            {originalPrice && (<span className="text-sm text-gray-400 line-through">
                R$ {originalPrice.toFixed(2)}
              </span>)}
          </div>
          <CardDescription className="text-gray-400">
            {(price / credits * 1000).toFixed(3)} por 1000 créditos
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-white text-sm">Com {credits.toLocaleString('pt-BR')} créditos você pode:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0"/>
                <span>{feature}</span>
              </li>))}
          </ul>
        </div>

        {/* Purchase Button */}
        <Button onClick={handlePurchase} disabled={isLoading} className={`w-full ${isPopular
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}>
          {isLoading ? (<>
              <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
              Processando...
            </>) : (<>
              <Coins className="h-4 w-4 mr-2"/>
              Comprar Agora
            </>)}
        </Button>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Pagamento seguro • Créditos não expiram
          </p>
          {isPopular && (<p className="text-xs text-purple-400 mt-1">
              Economia de R$ {((originalPrice || 0) - price).toFixed(2)}
            </p>)}
        </div>
      </CardContent>
    </Card>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0LXBhY2thZ2UtY2FyZC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjcmVkaXQtcGFja2FnZS1jYXJkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDaEcsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBVzFELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUNoQyxPQUFPLEVBQ1AsS0FBSyxFQUNMLGFBQWEsRUFDYixRQUFRLEVBQ1IsU0FBUyxHQUFHLEtBQUssRUFDakIsUUFBUSxFQUNlO0lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWpELE1BQU0sY0FBYyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixJQUFJLENBQUM7WUFDSCxpQ0FBaUM7WUFDakMsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3BELE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRTtvQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNuQztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDbkIsT0FBTztvQkFDUCxLQUFLO2lCQUNOLENBQUM7YUFDSCxDQUFDLENBQUE7WUFFRixJQUFJLFFBQVEs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