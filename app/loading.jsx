import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
export default function Loading() {
    return (<div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4"/>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Carregando...
          </h2>
          <p className="text-muted-foreground mb-6">
            Por favor, aguarde enquanto carregamos o conteúdo.
          </p>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full"/>
            <Skeleton className="h-4 w-3/4 mx-auto"/>
            <Skeleton className="h-4 w-1/2 mx-auto"/>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGluZy5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2FkaW5nLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDbkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUV0QyxNQUFNLENBQUMsT0FBTyxVQUFVLE9BQU87SUFDN0IsT0FBTyxDQUNMLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw2REFBNkQsQ0FDMUU7TUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQzFDO1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FDMUI7VUFBQSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0RBQWdELEVBQ25FO1VBQUEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLDRDQUE0QyxDQUN4RDs7VUFDRixFQUFFLEVBQUUsQ0FDSjtVQUFBLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FDdkM7O1VBQ0YsRUFBRSxDQUFDLENBQ0g7VUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtZQUFBLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQ2hDO1lBQUEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUN2QztZQUFBLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFDekM7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxHQUFHLENBQ1A7SUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUE7QUFDSCxDQUFDIn0=