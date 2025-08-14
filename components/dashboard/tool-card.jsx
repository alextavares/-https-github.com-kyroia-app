"use client";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
export function ToolCard({ title, description, icon, preview, badge, badgeVariant = "secondary", onClick, disabled = false, className }) {
    return (<Card className={cn("group relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full", "cursor-pointer hover:-translate-y-1 bg-gray-900 border-gray-700 hover:bg-gray-800", disabled && "opacity-70 cursor-not-allowed", className)} onClick={disabled ? undefined : onClick}>
      {/* Preview Image */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
        {preview && preview.startsWith('http') ? (<Image src={preview} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105"/>) : (<div className="flex h-full w-full items-center justify-center text-8xl opacity-30 text-gray-500">
            {icon}
          </div>)}
        
        {/* Badge overlay */}
        {badge && (<div className="absolute top-4 right-4">
            <Badge variant={badgeVariant} className={cn("text-xs font-medium", badgeVariant === "secondary" && "bg-purple-600 text-white border-purple-500", badgeVariant === "default" && "bg-blue-600 text-white border-blue-500")}>
              {badge}
            </Badge>
          </div>)}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400 flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold text-white mb-1 line-clamp-1">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 line-clamp-2">
                {description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-gray-600"/>
    </Card>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbC1jYXJkLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRvb2wtY2FyZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFjLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQ2hHLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUc3QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sS0FBSyxNQUFNLFlBQVksQ0FBQTtBQWM5QixNQUFNLFVBQVUsUUFBUSxDQUFDLEVBQ3ZCLEtBQUssRUFDTCxXQUFXLEVBQ1gsSUFBSSxFQUNKLE9BQU8sRUFDUCxLQUFLLEVBQ0wsWUFBWSxHQUFHLFdBQVcsRUFDMUIsT0FBTyxFQUNQLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLFNBQVMsRUFDSztJQUNkLE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FDSCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsbUZBQW1GLEVBQ25GLG1GQUFtRixFQUNuRixRQUFRLElBQUksK0JBQStCLEVBQzNDLFNBQVMsQ0FDVixDQUFDLENBQ0YsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUV4QztNQUFBLENBQUMsbUJBQW1CLENBQ3BCO01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtGQUFrRixDQUMvRjtRQUFBLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3ZDLENBQUMsS0FBSyxDQUNKLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUNiLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNYLElBQUksQ0FDSixTQUFTLENBQUMsc0VBQXNFLEVBQ2hGLENBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FDRixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0ZBQWtGLENBQy9GO1lBQUEsQ0FBQyxJQUFJLENBQ1A7VUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBRUQ7O1FBQUEsQ0FBQyxtQkFBbUIsQ0FDcEI7UUFBQSxDQUFDLEtBQUssSUFBSSxDQUNSLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FDckM7WUFBQSxDQUFDLEtBQUssQ0FDSixPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FDdEIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLHFCQUFxQixFQUNyQixZQUFZLEtBQUssV0FBVyxJQUFJLDRDQUE0QyxFQUM1RSxZQUFZLEtBQUssU0FBUyxJQUFJLHdDQUF3QyxDQUN2RSxDQUFDLENBRUY7Y0FBQSxDQUFDLEtBQUssQ0FDUjtZQUFBLEVBQUUsS0FBSyxDQUNUO1VBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUNIO01BQUEsRUFBRSxHQUFHLENBRUw7O01BQUEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FDMUI7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FDckM7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkZBQTZGLENBQzFHO2NBQUEsQ0FBQyxJQUFJLENBQ1A7WUFBQSxFQUFFLEdBQUcsQ0FDTDtZQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FDN0I7Y0FBQSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsc0RBQXNELENBQ3pFO2dCQUFBLENBQUMsS0FBSyxDQUNSO2NBQUEsRUFBRSxTQUFTLENBQ1g7Y0FBQSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsb0NBQW9DLENBQzdEO2dCQUFBLENBQUMsV0FBVyxDQUNkO2NBQUEsRUFBRSxlQUFlLENBQ25CO1lBQUEsRUFBRSxHQUFHLENBQ1A7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxXQUFXLENBRWI7O01BQUEsQ0FBQyx5QkFBeUIsQ0FDMUI7TUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUdBQXVHLEVBQ3hIO0lBQUEsRUFBRSxJQUFJLENBQUMsQ0FDUixDQUFBO0FBQ0gsQ0FBQyJ9