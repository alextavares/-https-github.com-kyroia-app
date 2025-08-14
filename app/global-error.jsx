'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
export default function GlobalError({ error, reset, }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global application error:', error);
    }, [error]);
    return (<html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4"/>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Erro crítico do sistema
              </h1>
              <p className="text-muted-foreground mb-6">
                Ocorreu um erro crítico na aplicação. Por favor, recarregue a página.
              </p>
              <div className="space-y-3">
                <Button onClick={reset} className="w-full" variant="default">
                  Tentar novamente
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4"/>
                  Ir para página inicial
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
        </div>
      </body>
    </html>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLWVycm9yLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdsb2JhbC1lcnJvci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNqQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFFbEQsTUFBTSxDQUFDLE9BQU8sVUFBVSxXQUFXLENBQUMsRUFDbEMsS0FBSyxFQUNMLEtBQUssR0FJTjtJQUNDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYiw4Q0FBOEM7UUFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuRCxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRVgsT0FBTyxDQUNMLENBQUMsSUFBSSxDQUNIO01BQUEsQ0FBQyxJQUFJLENBQ0g7UUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkRBQTZELENBQzFFO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUMxQztZQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQzFCO2NBQUEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLHlDQUF5QyxFQUNsRTtjQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx5Q0FBeUMsQ0FDckQ7O2NBQ0YsRUFBRSxFQUFFLENBQ0o7Y0FBQSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQ3ZDOztjQUNGLEVBQUUsQ0FBQyxDQUNIO2NBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7Z0JBQUEsQ0FBQyxNQUFNLENBQ0wsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ2YsU0FBUyxDQUFDLFFBQVEsQ0FDbEIsT0FBTyxDQUFDLFNBQVMsQ0FFakI7O2dCQUNGLEVBQUUsTUFBTSxDQUNSO2dCQUFBLENBQUMsTUFBTSxDQUNMLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUMxQyxPQUFPLENBQUMsU0FBUyxDQUNqQixTQUFTLENBQUMsUUFBUSxDQUVsQjtrQkFBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUM5Qjs7Z0JBQ0YsRUFBRSxNQUFNLENBQ1Y7Y0FBQSxFQUFFLEdBQUcsQ0FDTDtjQUFBLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssYUFBYSxJQUFJLENBQ3pDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FDakM7a0JBQUEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxDQUMvRDs7a0JBQ0YsRUFBRSxPQUFPLENBQ1Q7a0JBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGlEQUFpRCxDQUM5RDtvQkFBQSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ2Q7b0JBQUEsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUN0QztrQkFBQSxFQUFFLEdBQUcsQ0FDUDtnQkFBQSxFQUFFLE9BQU8sQ0FBQyxDQUNYLENBQ0g7WUFBQSxFQUFFLEdBQUcsQ0FDUDtVQUFBLEVBQUUsR0FBRyxDQUNQO1FBQUEsRUFBRSxHQUFHLENBQ1A7TUFBQSxFQUFFLElBQUksQ0FDUjtJQUFBLEVBQUUsSUFBSSxDQUFDLENBQ1IsQ0FBQTtBQUNILENBQUMifQ==