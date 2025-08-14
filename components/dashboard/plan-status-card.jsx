"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export function PlanStatusCard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/dashboard/plan', { cache: 'no-store' });
                if (res.ok) {
                    const json = (await res.json());
                    setData(json);
                }
            }
            catch (_a) {
                // silent
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    if (loading || !data)
        return null;
    const { plan, credits, recommendations } = data;
    const showLow = credits.isLowBalance === true;
    return (<Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status do Plano</CardTitle>
          <Badge variant="outline" className="border-border/50">
            {plan.type || 'FREE'}
          </Badge>
        </div>
        <CardDescription>
          Limites: {plan.dailyLimit} msgs/dia · {plan.monthlyLimit.toLocaleString('pt-BR')} tokens/mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Créditos</span>
          <span className={`${showLow ? 'text-yellow-400' : 'text-foreground'}`}>
            {credits.balance.toLocaleString('pt-BR')} {credits.currency}
          </span>
        </div>

        {showLow && (<div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
            Seu saldo está baixo (mínimo recomendado: {credits.recommendedMin}).
          </div>)}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-border/50">
            <Link href={showLow && recommendations && recommendations[0] ? `/dashboard/credits/purchase#${encodeURIComponent(recommendations[0].packageId)}` : "/dashboard/credits/purchase"}>
              Adicionar créditos
            </Link>
          </Button>
          {plan.type === 'FREE' && (<Button asChild size="sm">
              <Link href="/pricing">Upgrade</Link>
            </Button>)}
        </div>

        {showLow && recommendations && recommendations.length > 0 && (<div className="pt-2">
            <div className="text-xs text-muted-foreground mb-1">Sugestões</div>
            <ul className="space-y-1 text-sm">
              {recommendations.slice(0, 3).map((r) => (<li key={r.packageId} className="flex items-center justify-between">
                  <a href={`/dashboard/credits/purchase#${encodeURIComponent(r.packageId)}`} className="truncate pr-2 hover:underline">
                    {r.name} · {r.credits.toLocaleString('pt-BR')} créditos
                  </a>
                  <span className="text-muted-foreground">R$ {r.price.toFixed(2)}</span>
                </li>))}
            </ul>
          </div>)}
      </CardContent>
    </Card>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhbi1zdGF0dXMtY2FyZC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwbGFuLXN0YXR1cy1jYXJkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQ2hHLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFBO0FBOEI1QixNQUFNLFVBQVUsY0FBYztJQUM1QixNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBc0IsSUFBSSxDQUFDLENBQUE7SUFDM0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQVUsSUFBSSxDQUFDLENBQUE7SUFFckQsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLE1BQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3RCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNoQixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMscUJBQXFCLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtnQkFDckUsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBaUIsQ0FBQTtvQkFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNmLENBQUM7WUFDSCxDQUFDO1lBQUMsV0FBTSxDQUFDO2dCQUNQ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