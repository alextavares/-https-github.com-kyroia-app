"use client";
import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
export function SocialLoginButtons({ className, callbackUrl = "/dashboard" }) {
    const [isLoading, setIsLoading] = useState(null);
    const [availableProviders, setAvailableProviders] = useState(null);
    useEffect(() => {
        getProviders()
            .then((prov) => setAvailableProviders(prov !== null && prov !== void 0 ? prov : {}))
            .catch(() => setAvailableProviders({}));
    }, []);
    const handleSocialLogin = async (provider) => {
        setIsLoading(provider);
        try {
            await signIn(provider, { callbackUrl });
        }
        catch (error) {
            console.error(`Error signing in with ${provider}:`, error);
        }
        finally {
            setIsLoading(null);
        }
    };
    const socialProviders = [
        {
            id: "google",
            name: "Google",
            icon: Icons.google,
            className: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
        },
        {
            id: "apple",
            name: "Apple",
            icon: Icons.apple,
            className: "bg-black hover:bg-gray-900 text-white"
        }
    ];
    const providersToRender = useMemo(() => {
        if (!availableProviders)
            return [];
        return socialProviders.filter(p => !!availableProviders[p.id]);
    }, [availableProviders]);
    return (<div className={cn("grid grid-cols-2 gap-3", className)}>
      {providersToRender.map((provider) => {
            const Icon = provider.icon;
            return (<Button key={provider.id} variant="outline" className={cn("relative w-full", provider.className)} onClick={() => handleSocialLogin(provider.id)} disabled={isLoading !== null}>
            {isLoading === provider.id ? (<Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>) : (<Icon className="mr-2 h-4 w-4"/>)}
            Continuar com {provider.name}
          </Button>);
        })}
      {availableProviders && providersToRender.length === 0 && (<div className="col-span-2 text-center text-sm text-muted-foreground">
          Login social não configurado. Use login por email.
        </div>)}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29jaWFsLWxvZ2luLWJ1dHRvbnMuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic29jaWFsLWxvZ2luLWJ1dHRvbnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNwRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDMUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQU9oQyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsRUFDakMsU0FBUyxFQUNULFdBQVcsR0FBRyxZQUFZLEVBQ0Y7SUFDeEIsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQWdCLElBQUksQ0FBQyxDQUFBO0lBQy9ELE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLFFBQVEsQ0FBNkIsSUFBSSxDQUFDLENBQUE7SUFFOUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLFlBQVksRUFBRTthQUNYLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksRUFBRSxDQUFDLENBQUM7YUFDakQsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDM0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRU4sTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO1FBQ25ELFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN0QixJ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