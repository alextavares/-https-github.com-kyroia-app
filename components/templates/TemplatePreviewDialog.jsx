"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, TrendingUp, Calendar, User, Hash, Sparkles, Code, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
export function TemplatePreviewDialog({ open, onOpenChange, template, onUse }) {
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');
    const handleCopy = async () => {
        await navigator.clipboard.writeText(template.templateContent);
        setIsCopied(true);
        toast({
            title: "Conteúdo copiado!",
            description: "O template foi copiado para a área de transferência.",
        });
        setTimeout(() => setIsCopied(false), 2000);
    };
    const handleUse = () => {
        onUse();
        onOpenChange(false);
    };
    const gradients = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };
    const gradient = template.gradient || 'blue';
    const gradientClass = gradients[gradient] || gradients.blue;
    // Extract variables from template content
    const extractVariables = (content) => {
        const matches = content.match(/\[([^\]]+)\]/g);
        return matches ? matches.map(match => match.slice(1, -1)) : [];
    };
    const variables = extractVariables(template.templateContent);
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0", `bg-gradient-to-br ${gradientClass} text-white shadow-lg`)}>
              {template.icon || '📝'}
            </div>

            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {template.name}
                {template.isFeatured && (<Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1"/>
                    Destaque
                  </Badge>)}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {template.description}
              </DialogDescription>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4"/>
                  <span>{template.usageCount.toLocaleString()} usos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4"/>
                  <span>Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {template.createdBy && (<div className="flex items-center gap-1">
                    <User className="w-4 h-4"/>
                    <span>{template.createdBy}</span>
                  </div>)}
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">
                  {template.tags.map((tag, index) => (<Badge key={index} variant="outline" className="text-xs">
                      <Hash className="w-3 h-3 mr-1"/>
                      {tag}
                    </Badge>))}
                </div>)}
            </div>
          </div>
        </DialogHeader>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4"/>
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <Code className="w-4 h-4"/>
              Código
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="font-semibold mb-4">Template Preview</h3>
              
              {/* Variables */}
              {variables.length > 0 && (<div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Variáveis detectadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable, index) => (<div key={index} className="px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-mono">
                        [{variable}]
                      </div>))}
                  </div>
                </div>)}

              {/* Content Preview */}
              <ScrollArea className="h-[300px] w-full rounded-md border bg-background p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {template.templateContent}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50">
                <pre className="p-4 text-sm font-mono">
                  <code>{template.templateContent}</code>
                </pre>
              </ScrollArea>
              
              <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={handleCopy}>
                {isCopied ? (<>
                    <Check className="w-4 h-4 mr-2"/>
                    Copiado!
                  </>) : (<>
                    <Copy className="w-4 h-4 mr-2"/>
                    Copiar
                  </>)}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleUse} className="gradient-primary text-white">
            <Sparkles className="w-4 h-4 mr-2"/>
            Usar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVtcGxhdGVQcmV2aWV3RGlhbG9nLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlbXBsYXRlUHJldmlld0RpYWxvZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNoQyxPQUFPLEVBQ0wsTUFBTSxFQUNOLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEdBQ1osTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDeEQsT0FBTyxFQUNMLElBQUksRUFDSixLQUFLLEVBRUwsVUFBVSxFQUNWLFFBQVEsRUFDUixJQUFJLEVBQ0osSUFBSSxFQUNKLFFBQVEsRUFDUixJQUFJLEVBQ0osR0FBRyxFQUNKLE1BQU0sY0FBYyxDQUFBO0FBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBeUJ6QyxNQUFNLFVBQVUscUJBQXFCLENBQUMsRUFDcEMsSUFBSSxFQUNKLFlBQVksRUFDWixRQUFRLEVBQ1IsS0FBSyxFQUNzQjtJQUMzQixNQUFNLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUMvQyxNQUFNLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVyRCxN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