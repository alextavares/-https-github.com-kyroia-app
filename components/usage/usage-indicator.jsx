"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
export default function UsageIndicator({ variant = "minimal" }) {
    const { data: session } = useSession();
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(false);
    const fetchUsage = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/usage/today");
            if (response.ok) {
                const data = await response.json();
                setUsage(data);
            }
        }
        catch (_a) {
            // silent
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (session === null || session === void 0 ? void 0 : session.user) {
            fetchUsage();
        }
    }, [session, fetchUsage]);
    if (loading || !usage)
        return null;
    const percentage = usage.dailyLimit > 0
        ? (usage.dailyMessages / usage.dailyLimit) * 100
        : 0;
    const isNearLimit = usage.dailyLimit > 0 && percentage >= 80;
    const isAtLimit = usage.dailyLimit > 0 && usage.dailyMessages >= usage.dailyLimit;
    // Minimal: mostrar apenas quando perto ou no limite, como um badge discreto
    if (variant === "minimal") {
        if (!isNearLimit && !isAtLimit)
            return null;
        return (<div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300">
        {isAtLimit ? "Limite diário atingido" : "Próximo do limite diário"}
      </div>);
    }
    // Detailed (opcional)
    return (<div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Uso Diário</h3>
        <span className="text-xs text-muted-foreground">
          Plano {usage.planType}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Mensagens</span>
          <span className={isAtLimit ? "text-destructive" : ""}>
            {usage.dailyMessages} / {usage.dailyLimit === -1 ? "∞" : usage.dailyLimit}
          </span>
        </div>
        {usage.dailyLimit > 0 && (<div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div className={`h-full transition-all ${isAtLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-primary"}`} style={{ width: `${Math.min(percentage, 100)}%` }}/>
          </div>)}
        {isAtLimit && (<p className="text-xs text-destructive mt-2">
            Limite diário atingido. Faça upgrade para continuar.
          </p>)}
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNhZ2UtaW5kaWNhdG9yLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzYWdlLWluZGljYXRvci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQVU1QyxNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxTQUFTLEVBQXlCO0lBQ25GLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUE7SUFDdEMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQW1CLElBQUksQ0FBQyxDQUFBO0lBQzFELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRTdDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtZQUNoRCxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBQ2xDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNoQixDQUFDO1FBQ0gsQ0FBQztRQUFDLFdBQU0sQ0FBQztZQUNQLFNBQVM7UUFDWCxDQUFDO2dCQUFTLENBQUM7WUFDVCxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbkIsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLFNBQVMsQ0FB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