'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
export default function Error({ error, reset, }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);
    return (<div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4"/>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Algo deu errado!
          </h1>
          <p className="text-muted-foreground mb-6">
            Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
          </p>
          <div className="space-y-3">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4"/>
              Tentar novamente
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
              Voltar ao início
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (<details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>)}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDakMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBRXJELE1BQU0sQ0FBQyxPQUFPLFVBQVUsS0FBSyxDQUFDLEVBQzVCLEtBQUssRUFDTCxLQUFLLEdBSU47SUFDQyxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsOENBQThDO1FBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDNUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUVYLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkRBQTZELENBQzFFO01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUMxQztRQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQzFCO1VBQUEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLHlDQUF5QyxFQUNoRTtVQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx5Q0FBeUMsQ0FDckQ7O1VBQ0YsRUFBRSxFQUFFLENBQ0o7VUFBQSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQ3ZDOztVQUNGLEVBQUUsQ0FBQyxDQUNIO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7WUFBQSxDQUFDLE1BQU0sQ0FDTCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDZixTQUFTLENBQUMsUUFBUSxDQUNsQixPQUFPLENBQUMsU0FBUyxDQUVqQjtjQUFBLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQ25DOztZQUNGLEVBQUUsTUFBTSxDQUNSO1lBQUEsQ0FBQyxNQUFNLENBQ0wsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQzFDLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLFNBQVMsQ0FBQyxRQUFRLENBRWxCOztZQUNGLEVBQUUsTUFBTSxDQUNWO1VBQUEsRUFBRSxHQUFHLENBQ0w7VUFBQSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsSUFBSSxDQUN6QyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQ2pDO2NBQUEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxDQUMvRDs7Y0FDRixFQUFFLE9BQU8sQ0FDVDtjQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxpREFBaUQsQ0FDOUQ7Z0JBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUNkO2dCQUFBLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FDdEM7Y0FBQSxFQUFFLEdBQUcsQ0FDUDtZQUFBLEVBQUUsT0FBTyxDQUFDLENBQ1gsQ0FDSDtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxHQUFHLENBQ1A7SUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUE7QUFDSCxDQUFDIn0=