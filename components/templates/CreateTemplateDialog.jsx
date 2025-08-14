"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { templateCategories } from './TemplateCategories';
export function CreateTemplateDialog({ open, onOpenChange, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        templateContent: '',
        icon: '📝',
        gradient: 'blue',
        tags: '',
        isPublic: false,
        isFeatured: false,
    });
    const handleSubmit = async () => {
        if (!formData.name || !formData.category || !formData.templateContent) {
            toast({
                title: "Erro",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, formData), { tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) })),
            });
            if (response.ok) {
                toast({
                    title: "Sucesso!",
                    description: "Template criado com sucesso.",
                });
                onSuccess();
                resetForm();
            }
        }
        catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível criar o template.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            templateContent: '',
            icon: '📝',
            gradient: 'blue',
            tags: '',
            isPublic: false,
            isFeatured: false,
        });
    };
    const gradientOptions = [
        { value: 'blue', label: 'Azul', className: 'from-blue-500 to-blue-600' },
        { value: 'purple', label: 'Roxo', className: 'from-purple-500 to-purple-600' },
        { value: 'pink', label: 'Rosa', className: 'from-pink-500 to-pink-600' },
        { value: 'green', label: 'Verde', className: 'from-green-500 to-green-600' },
        { value: 'orange', label: 'Laranja', className: 'from-orange-500 to-orange-600' },
        { value: 'indigo', label: 'Índigo', className: 'from-indigo-500 to-indigo-600' },
    ];
    const iconOptions = ['📝', '💡', '🚀', '✨', '📊', '💼', '🎯', '📈', '🔥', '⚡'];
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogDescription>
            Crie um template personalizado para usar em suas conversas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value }))} placeholder="Ex: Gerador de Ideias de Conteúdo"/>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value }))} placeholder="Breve descrição do que o template faz"/>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria"/>
              </SelectTrigger>
              <SelectContent>
                {templateCategories.slice(1).map(category => (<SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      {category.name}
                    </div>
                  </SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon and Gradient */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (<button key={icon} type="button" onClick={() => setFormData(Object.assign(Object.assign({}, formData), { icon }))} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <span className="text-lg">{icon}</span>
                  </button>))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Gradiente</Label>
              <div className="flex flex-wrap gap-2">
                {gradientOptions.map(option => (<button key={option.value} type="button" onClick={() => setFormData(Object.assign(Object.assign({}, formData), { gradient: option.value }))} className={`w-20 h-10 rounded-lg bg-gradient-to-r ${option.className} border-2 transition-all hover:scale-110 ${formData.gradient === option.value ? 'border-primary' : 'border-transparent'}`}/>))}
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Template *</Label>
            <Textarea id="content" value={formData.templateContent} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { templateContent: e.target.value }))} placeholder="Digite o prompt do template. Use [VARIÁVEL] para criar campos substituíveis..." className="min-h-[200px] font-mono text-sm"/>
            <p className="text-xs text-muted-foreground">
              Dica: Use [TÓPICO], [NOME], [EMPRESA] etc. para criar variáveis dinâmicas
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" value={formData.tags} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { tags: e.target.value }))} placeholder="marketing, vendas, email"/>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
                Tornar este template público
              </Label>
              <Switch id="public" checked={formData.isPublic} onCheckedChange={(checked) => setFormData(Object.assign(Object.assign({}, formData), { isPublic: checked }))}/>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gradient-primary text-white">
            {isLoading ? "Criando..." : "Criar Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlVGVtcGxhdGVEaWFsb2cuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ3JlYXRlVGVtcGxhdGVEaWFsb2cudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDaEMsT0FBTyxFQUNMLE1BQU0sRUFDTixhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixZQUFZLEVBQ1osV0FBVyxHQUNaLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ25ELE9BQU8sRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLFVBQVUsRUFDVixhQUFhLEVBQ2IsV0FBVyxHQUNaLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQVF6RCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsRUFDbkMsSUFBSSxFQUNKLFlBQVksRUFDWixTQUFTLEVBQ2lCO0lBQzFCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2pELE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ3ZDLElBQUksRUFBRSxFQUFFO1FBQ1IsV0FBVyxFQUFFLEVBQUU7UUFDZixRQUFRLEVBQUUsRUFBRTtRQUNaLGVBQWUsRUFBRSxFQUFFO1FBQ25CLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLE1BQU07UUFDaEIsSUFBSSxFQUFFLEVBQUU7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLFVBQVUsRUFBRSxLQUFLO0tBQ2xCLENBQUMsQ0FBQTtJQUVGLE1BQU0sWUFBWSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN0RSxLQUFLLENBQUM7Z0JBQ0osS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLHVDQUF1QztnQkFDcEQsT0FBTyxFQUFFLGFBQWE7YUFDdkIsQ0FBQyxDQUFBO1lBQ0YsT0FBTTtRQUNSLENBQUM7UUFFRCxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFbEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzdDLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtnQkFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLGlDQUNmLFFBQVEsS0FDWCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUNyRTthQUNILENBQUMsQ0FBQTtZQUVGLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNoQixLQUFLLENBQUM7b0JBQ0osS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLFdBQVcsRUFBRSw4QkFBOEI7aUJBQzVDLENBQUMsQ0FBQTtnQkFDRixTQUFTLEVBQUUsQ0FBQTtnQkFDWCxTQUFTLEVBQUUsQ0FBQTtZQUNiLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLEtBQUssQ0FBQztnQkFDSixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsb0NBQW9DO2dCQUNqRCxPQUFPLEVBQUUsYUFBYTthQUN2QixDQUFDLENBQUE7UUFDSixDQUFDO2dCQUFTLENBQUM7WUFDVCxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDckIsQ0FBQztJQUNILENBQUMsQ0FBQTtJQUVELE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRTtRQUNyQixXQUFXLENBQUM7WUFDVixJQUFJLEVBQUUsRUFBRTtZQUNSLFdBQVcsRUFBRSxFQUFFO1lBQ2YsUUFBUSxFQUFFLEVBQUU7WUFDWixlQUFlLEVBQUUsRUFBRTtZQUNuQixJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLElBQUksRUFBRSxFQUFFO1lBQ1IsUUFBUSxFQUFFLEtBQUs7WUFDZixVQUFVLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDLENBQUE7SUFFRCxNQUFNLGVBQWUsR0FBRztRQUN0QixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsMkJBQTJCLEVBQUU7UUFDeEUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLCtCQUErQixFQUFFO1FBQzlFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSwyQkFBMkIsRUFBRTtRQUN4RSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsNkJBQTZCLEVBQUU7UUFDNUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLCtCQUErQixFQUFFO1FBQ2pGLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSwrQkFBK0IsRUFBRTtLQUNqRixDQUFBO0lBRUQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU5RSxPQUFPLENBQ0wsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQzdDO01BQUEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxDQUMvRDtRQUFBLENBQUMsWUFBWSxDQUNYO1VBQUEsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUM3QztVQUFBLENBQUMsaUJBQWlCLENBQ2hCOztVQUNGLEVBQUUsaUJBQWlCLENBQ3JCO1FBQUEsRUFBRSxZQUFZLENBRWQ7O1FBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUM3QjtVQUFBLENBQUMsVUFBVSxDQUNYO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7WUFBQSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FDL0M7WUFBQSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsTUFBTSxDQUNULEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FDckIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBRyxDQUFDLENBQ3BFLFdBQVcsQ0FBQyxtQ0FBbUMsRUFFbkQ7VUFBQSxFQUFFLEdBQUcsQ0FFTDs7VUFBQSxDQUFDLGlCQUFpQixDQUNsQjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQ3hCO1lBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUM3QztZQUFBLENBQUMsS0FBSyxDQUNKLEVBQUUsQ0FBQyxhQUFhLENBQ2hCLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FDNUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBRyxDQUFDLENBQzNFLFdBQVcsQ0FBQyx1Q0FBdUMsRUFFdkQ7VUFBQSxFQUFFLEdBQUcsQ0FFTDs7VUFBQSxDQUFDLGNBQWMsQ0FDZjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQ3hCO1lBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUM1QztZQUFBLENBQUMsTUFBTSxDQUNMLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDekIsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLFFBQVEsRUFBRSxLQUFLLElBQUcsQ0FBQyxDQUV4RTtjQUFBLENBQUMsYUFBYSxDQUNaO2dCQUFBLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFDcEQ7Y0FBQSxFQUFFLGFBQWEsQ0FDZjtjQUFBLENBQUMsYUFBYSxDQUNaO2dCQUFBLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQzNDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQy9DO29CQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FDdEM7c0JBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUM1QjtzQkFBQSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ2hCO29CQUFBLEVBQUUsR0FBRyxDQUNQO2tCQUFBLEVBQUUsVUFBVSxDQUFDLENBQ2QsQ0FBQyxDQUNKO2NBQUEsRUFBRSxhQUFhLENBQ2pCO1lBQUEsRUFBRSxNQUFNLENBQ1Y7VUFBQSxFQUFFLEdBQUcsQ0FFTDs7VUFBQSxDQUFDLHVCQUF1QixDQUN4QjtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FDckM7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtjQUFBLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQ25CO2NBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUNuQztnQkFBQSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUN2QixDQUFDLE1BQU0sQ0FDTCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDVixJQUFJLENBQUMsUUFBUSxDQUNiLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLElBQUksSUFBRyxDQUFDLENBQ2xELFNBQVMsQ0FBQyxDQUFDLGlHQUNULFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsZUFDNUQsRUFBRSxDQUFDLENBRUg7b0JBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FDeEM7a0JBQUEsRUFBRSxNQUFNLENBQUMsQ0FDVixDQUFDLENBQ0o7Y0FBQSxFQUFFLEdBQUcsQ0FDUDtZQUFBLEVBQUUsR0FBRyxDQUVMOztZQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQ3hCO2NBQUEsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUM5QjtjQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FDbkM7Z0JBQUEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FDN0IsQ0FBQyxNQUFNLENBQ0wsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNsQixJQUFJLENBQUMsUUFBUSxDQUNiLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsS0FBSyxJQUFHLENBQUMsQ0FDcEUsU0FBUyxDQUFDLENBQUMseUNBQXlDLE1BQU0sQ0FBQyxTQUFTLDRDQUNsRSxRQUFRLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxvQkFDMUQsRUFBRSxDQUFDLEVBQ0gsQ0FDSCxDQUFDLENBQ0o7Y0FBQSxFQUFFLEdBQUcsQ0FDUDtZQUFBLEVBQUUsR0FBRyxDQUNQO1VBQUEsRUFBRSxHQUFHLENBRUw7O1VBQUEsQ0FBQyxzQkFBc0IsQ0FDdkI7VUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtZQUFBLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUN0RDtZQUFBLENBQUMsUUFBUSxDQUNQLEVBQUUsQ0FBQyxTQUFTLENBQ1osS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUNoQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxpQ0FBTSxRQUFRLEtBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFHLENBQUMsQ0FDL0UsV0FBVyxDQUFDLGdGQUFnRixDQUM1RixTQUFTLENBQUMsaUNBQWlDLEVBRTdDO1lBQUEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUMxQzs7WUFDRixFQUFFLENBQUMsQ0FDTDtVQUFBLEVBQUUsR0FBRyxDQUVMOztVQUFBLENBQUMsVUFBVSxDQUNYO1VBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7WUFBQSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FDekQ7WUFBQSxDQUFDLEtBQUssQ0FDSixFQUFFLENBQUMsTUFBTSxDQUNULEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FDckIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsaUNBQU0sUUFBUSxLQUFFLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBRyxDQUFDLENBQ3BFLFdBQVcsQ0FBQywwQkFBMEIsRUFFMUM7VUFBQSxFQUFFLEdBQUcsQ0FFTDs7VUFBQSxDQUFDLGFBQWEsQ0FDZDtVQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQ3hCO1lBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUNoRDtjQUFBLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxDQUNwRTs7Y0FDRixFQUFFLEtBQUssQ0FDUDtjQUFBLENBQUMsTUFBTSxDQUNMLEVBQUUsQ0FBQyxRQUFRLENBQ1gsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUMzQixlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsV0FBVyxpQ0FBTSxRQUFRLEtBQUUsUUFBUSxFQUFFLE9BQU8sSUFBRyxDQUFDLEVBRWxGO1lBQUEsRUFBRSxHQUFHLENBQ1A7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsR0FBRyxDQUVMOztRQUFBLENBQUMsWUFBWSxDQUNYO1VBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDM0Q7O1VBQ0YsRUFBRSxNQUFNLENBQ1I7VUFBQSxDQUFDLE1BQU0sQ0FDTCxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FDdEIsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQ3BCLFNBQVMsQ0FBQyw2QkFBNkIsQ0FFdkM7WUFBQSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FDOUM7VUFBQSxFQUFFLE1BQU0sQ0FDVjtRQUFBLEVBQUUsWUFBWSxDQUNoQjtNQUFBLEVBQUUsYUFBYSxDQUNqQjtJQUFBLEVBQUUsTUFBTSxDQUFDLENBQ1YsQ0FBQTtBQUNILENBQUMifQ==