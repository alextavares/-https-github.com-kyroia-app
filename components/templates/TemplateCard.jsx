"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, Check, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
export default function TemplateCard({ template, onFavorite, onUse }) {
    const [isCopied, setIsCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(template.name);
        setIsCopied(true);
        toast({
            title: "Template copiado!",
            description: "O nome do template foi copiado para a área de transferência.",
        });
        setTimeout(() => setIsCopied(false), 2000);
    };
    const gradients = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };
    const gradient = template.gradient || gradients.blue;
    return (<Card className={cn("group relative transition-all duration-300 cursor-pointer", "hover:shadow-xl hover:-translate-y-1", "bg-card border-border")} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onUse(template.id)}>
      {/* Gradient Background Effect */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none", `bg-gradient-to-br ${gradient}`)}/>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", `bg-gradient-to-br ${gradient} text-white`)}>
              {template.icon || '📝'}
            </div>

            {/* Title and Usage */}
            <div>
              <CardTitle className="text-lg font-semibold">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-3 h-3 text-muted-foreground"/>
                <span className="text-xs text-muted-foreground">
                  {template.usageCount.toLocaleString()} usos
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <Button size="sm" variant="ghost" className={cn("p-2 transition-all", template.isFavorite && "text-yellow-500")} onClick={(e) => {
            e.stopPropagation();
            onFavorite(template.id);
        }}>
            <Star className={cn("w-4 h-4 transition-all", template.isFavorite && "fill-yellow-500")}/>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <CardDescription className="text-sm line-clamp-2">
          {template.description}
        </CardDescription>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 h-9">
          <Button size="sm" variant="secondary" className="flex-1 text-xs h-8 opacity-30 hover:opacity-100 transition-opacity duration-300" onClick={(e) => {
            e.stopPropagation();
            onUse(template.id);
        }}>
            Usar Template
          </Button>
          
          <Button size="sm" variant="ghost" className="p-0 w-8 h-8 shrink-0 opacity-30 hover:opacity-100 transition-opacity duration-300" onClick={(e) => {
            e.stopPropagation();
            handleCopy();
        }}>
            {isCopied ? (<Check className="w-3 h-3 text-green-500"/>) : (<Copy className="w-3 h-3"/>)}
          </Button>
        </div>
      </CardContent>

      {/* Category Badge */}
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-xs capitalize">
          {template.category}
        </Badge>
      </div>
    </Card>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVtcGxhdGVDYXJkLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlbXBsYXRlQ2FyZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNoQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQ2hHLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUM1RCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQWlCekMsTUFBTSxDQUFDLE9BQU8sVUFBVSxZQUFZLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUI7SUFDckYsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDL0MsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFakQsTUFBTSxVQUFVLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDNUIsTUFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEQsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2pCLEtBQUssQ0FBQztZQUNKLEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsV0FBVyxFQUFFLDhEQUE4RDtTQUM1RSxDQUFDLENBQUE7UUFDRixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQTtJQUVELE1BQU0sU0FBUyxHQUFHO1FBQ2hCLElBQUksRUFBRSwyQkFBMkI7UUFDakMsTUFBTSxFQUFFLCtCQUErQjtRQUN2QyxJQUFJLEVBQUUsMkJBQTJCO1FBQ2pDLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsTUFBTSxFQUFFLCtCQUErQjtRQUN2QyxNQUFNLEVBQUUsK0JBQStCO0tBQ3hDLENBQUE7SUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUE7SUFFcEQsT0FBTyxDQUNMLENBQUMsSUFBSSxDQUNILFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCwyREFBMkQsRUFDM0Qsc0NBQXNDLEVBQ3RDLHVCQUF1QixDQUN4QixDQUFDLENBQ0YsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3ZDLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUN4QyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBRWxDO01BQUEsQ0FBQyxnQ0FBZ0MsQ0FDakM7TUFBQSxDQUFDLEdBQUcsQ0FDRixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsaUhBQWlILEVBQ2pILHFCQUFxQixRQUFRLEVBQUUsQ0FDaEMsQ0FBQyxFQUdKOztNQUFBLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQzFCO1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUMvQztVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FDdEM7WUFBQSxDQUFDLFVBQVUsQ0FDWDtZQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDaEIsK0RBQStELEVBQy9ELHFCQUFxQixRQUFRLGFBQWEsQ0FDM0MsQ0FBQyxDQUNBO2NBQUEsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksQ0FDeEI7WUFBQSxFQUFFLEdBQUcsQ0FFTDs7WUFBQSxDQUFDLHFCQUFxQixDQUN0QjtZQUFBLENBQUMsR0FBRyxDQUNGO2NBQUEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUMxQztnQkFBQSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ2hCO2NBQUEsRUFBRSxTQUFTLENBQ1g7Y0FBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQzNDO2dCQUFBLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsRUFDckQ7Z0JBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUM3QztrQkFBQSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUU7Z0JBQ3pDLEVBQUUsSUFBSSxDQUNSO2NBQUEsRUFBRSxHQUFHLENBQ1A7WUFBQSxFQUFFLEdBQUcsQ0FDUDtVQUFBLEVBQUUsR0FBRyxDQUVMOztVQUFBLENBQUMscUJBQXFCLENBQ3RCO1VBQUEsQ0FBQyxNQUFNLENBQ0wsSUFBSSxDQUFDLElBQUksQ0FDVCxPQUFPLENBQUMsT0FBTyxDQUNmLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCxvQkFBb0IsRUFDcEIsUUFBUSxDQUFDLFVBQVUsSUFBSSxpQkFBaUIsQ0FDekMsQ0FBQyxDQUNGLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDYixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUE7WUFDbkIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN6QixDQUFDLENBQUMsQ0FFRjtZQUFBLENBQUMsSUFBSSxDQUNILFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx3QkFBd0IsRUFDeEIsUUFBUSxDQUFDLFVBQVUsSUFBSSxpQkFBaUIsQ0FDekMsQ0FBQyxFQUVOO1VBQUEsRUFBRSxNQUFNLENBQ1Y7UUFBQSxFQUFFLEdBQUcsQ0FDUDtNQUFBLEVBQUUsVUFBVSxDQUVaOztNQUFBLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQy9CO1FBQUEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUMvQztVQUFBLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FDdkI7UUFBQSxFQUFFLGVBQWUsQ0FFakI7O1FBQUEsQ0FBQyxvQkFBb0IsQ0FDckI7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0NBQWtDLENBQy9DO1VBQUEsQ0FBQyxNQUFNLENBQ0wsSUFBSSxDQUFDLElBQUksQ0FDVCxPQUFPLENBQUMsV0FBVyxDQUNuQixTQUFTLENBQUMsaUZBQWlGLENBQzNGLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDYixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUE7WUFDbkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNwQixDQUFDLENBQUMsQ0FFRjs7VUFDRixFQUFFLE1BQU0sQ0FFUjs7VUFBQSxDQUFDLE1BQU0sQ0FDTCxJQUFJLENBQUMsSUFBSSxDQUNULE9BQU8sQ0FBQyxPQUFPLENBQ2YsU0FBUyxDQUFDLG1GQUFtRixDQUM3RixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2IsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFBO1lBQ25CLFVBQVUsRUFBRSxDQUFBO1FBQ2QsQ0FBQyxDQUFDLENBRUY7WUFBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDVixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUcsQ0FDN0MsQ0FBQyxDQUFDLENBQUMsQ0FDRixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFHLENBQzdCLENBQ0g7VUFBQSxFQUFFLE1BQU0sQ0FDVjtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxXQUFXLENBRWI7O01BQUEsQ0FBQyxvQkFBb0IsQ0FDckI7TUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQ3JDO1FBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQ3ZEO1VBQUEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNwQjtRQUFBLEVBQUUsS0FBSyxDQUNUO01BQUEsRUFBRSxHQUFHLENBQ1A7SUFBQSxFQUFFLElBQUksQ0FBQyxDQUNSLENBQUE7QUFDSCxDQUFDIn0=