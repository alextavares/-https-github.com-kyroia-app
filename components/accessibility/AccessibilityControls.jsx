'use client';
import { useAccessibility } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Eye, Type, Volume2 } from 'lucide-react';
export function AccessibilityControls() {
    const { highContrast, reducedMotion, fontSize, setHighContrast, setReducedMotion, setFontSize, announce, } = useAccessibility();
    const handleHighContrastChange = (enabled) => {
        setHighContrast(enabled);
        announce(enabled ? 'Alto contraste ativado' : 'Alto contraste desativado');
    };
    const handleReducedMotionChange = (enabled) => {
        setReducedMotion(enabled);
        announce(enabled ? 'Animações reduzidas ativadas' : 'Animações reduzidas desativadas');
    };
    const handleFontSizeChange = (size) => {
        setFontSize(size);
        const sizeNames = {
            small: 'pequeno',
            medium: 'médio',
            large: 'grande'
        };
        announce(`Tamanho da fonte alterado para ${sizeNames[size]}`);
    };
    return (<Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Abrir configurações de acessibilidade" title="Configurações de Acessibilidade">
          <Settings className="h-4 w-4"/>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5"/>
            Configurações de Acessibilidade
          </DialogTitle>
          <DialogDescription>
            Ajuste as configurações para melhorar sua experiência de navegação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* High Contrast */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4"/>
                Contraste Visual
              </CardTitle>
              <CardDescription>
                Aumenta o contraste para melhor visibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  Alto Contraste
                </Label>
                <Switch id="high-contrast" checked={highContrast} onCheckedChange={handleHighContrastChange} aria-describedby="high-contrast-description"/>
              </div>
              <p id="high-contrast-description" className="text-xs text-muted-foreground mt-2">
                {highContrast ? 'Ativado' : 'Desativado'}
              </p>
            </CardContent>
          </Card>

          {/* Reduced Motion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4"/>
                Movimento
              </CardTitle>
              <CardDescription>
                Reduz animações e transições para conforto visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduzir Animações
                </Label>
                <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={handleReducedMotionChange} aria-describedby="reduced-motion-description"/>
              </div>
              <p id="reduced-motion-description" className="text-xs text-muted-foreground mt-2">
                {reducedMotion ? 'Animações reduzidas' : 'Animações normais'}
              </p>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4"/>
                Tamanho do Texto
              </CardTitle>
              <CardDescription>
                Ajusta o tamanho da fonte para melhor legibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-sm font-medium">
                  Tamanho da Fonte
                </Label>
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger id="font-size" aria-describedby="font-size-description">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
                <p id="font-size-description" className="text-xs text-muted-foreground">
                  Tamanho atual: {fontSize === 'small' ? 'Pequeno' : fontSize === 'medium' ? 'Médio' : 'Grande'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Navigation Help */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Navegação por Teclado</CardTitle>
              <CardDescription>
                Atalhos úteis para navegação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div><kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> - Navegar para frente</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Shift + Tab</kbd> - Navegar para trás</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> - Ativar elemento</div>
                <div><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> - Fechar diálogos</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzaWJpbGl0eUNvbnRyb2xzLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFjY2Vzc2liaWxpdHlDb250cm9scy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDMUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDaEcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3RHLE9BQU8sRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osV0FBVyxFQUNYLGFBQWEsRUFDZCxNQUFNLHdCQUF3QixDQUFBO0FBQy9CLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFFM0QsTUFBTSxVQUFVLHFCQUFxQjtJQUNuQyxNQUFNLEVBQ0osWUFBWSxFQUNaLGFBQWEsRUFDYixRQUFRLEVBQ1IsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsUUFBUSxHQUNULEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQTtJQUV0QixNQUFNLHdCQUF3QixHQUFHLENBQUMsT0FBZ0IsRUFBRSxFQUFFO1FBQ3BELGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN4QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyx3QkFBd0Is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