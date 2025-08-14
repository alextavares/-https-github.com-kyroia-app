"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Sparkles, Zap, Brain, Gauge, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { INNERAI_MODELS, getModelsForPlan } from "@/lib/ai/innerai-models-config";
// Função para mapear modelos Kyroia para interface local
const mapKyroiaModel = (model) => {
    const getIcon = () => {
        if (model.features.includes('Web Search'))
            return <Globe className="h-4 w-4"/>;
        if (model.category === 'fast')
            return <Zap className="h-4 w-4"/>;
        if (model.category === 'advanced')
            return <Brain className="h-4 w-4"/>;
        if (model.category === 'reasoning')
            return <Gauge className="h-4 w-4"/>;
        return <Sparkles className="h-4 w-4"/>;
    };
    const getBadge = () => {
        if (model.id === 'gpt-4o-mini')
            return { text: 'Recomendado', variant: 'default' };
        if (model.id === 'claude-3.5-haiku')
            return { text: 'Mais rápido', variant: 'outline' };
        if (model.id === 'gemini-2.5-flash')
            return { text: '1M tokens', variant: 'secondary' };
        if (model.id === 'deepseek-r1')
            return { text: 'Popular', variant: 'secondary' };
        if (model.category === 'reasoning')
            return { text: 'Raciocínio', variant: 'destructive' };
        if (model.planRequired === 'PRO')
            return { text: 'PRO', variant: 'default' };
        if (model.planRequired === 'LITE')
            return { text: 'LITE', variant: 'outline' };
        return null;
    };
    const getCost = () => {
        const inputCost = model.costPer1kTokens.input;
        if (inputCost === 0)
            return "$";
        if (inputCost < 0.001)
            return "$";
        if (inputCost < 0.005)
            return "$$";
        if (inputCost < 0.01)
            return "$$$";
        return "$$$$";
    };
    const getSpeed = () => {
        if (model.performance.speed === 'fast')
            return 'very-fast';
        return model.performance.speed;
    };
    const getIntelligence = () => {
        if (model.performance.quality === 'superior')
            return 'state-of-the-art';
        if (model.performance.quality === 'excellent')
            return 'advanced';
        return 'good';
    };
    const badge = getBadge();
    return {
        id: model.id,
        name: model.name,
        provider: model.provider,
        category: model.category,
        description: model.description,
        icon: getIcon(),
        badge: badge === null || badge === void 0 ? void 0 : badge.text,
        badgeVariant: badge === null || badge === void 0 ? void 0 : badge.variant,
        speed: getSpeed(),
        intelligence: getIntelligence(),
        cost: getCost(),
        maxTokens: model.contextWindow,
        features: model.features,
        planRequired: model.planRequired,
        isAvailable: model.isAvailable
    };
};
// Converter e filtrar apenas modelos disponíveis por plano atual (carregado no client)
function computeModelsForPlan(plan) {
    try {
        return getModelsForPlan(plan)
            .filter(m => m.isAvailable)
            .map(mapKyroiaModel);
    }
    catch (_a) {
        return INNERAI_MODELS.filter(m => m.isAvailable).map(mapKyroiaModel);
    }
}
export function ModelSelector() {
    const [planType, setPlanType] = useState('FREE');
    const [models, setModels] = useState(computeModelsForPlan('FREE'));
    const [selectedModel, setSelectedModel] = useState(computeModelsForPlan('FREE')[0]);
    // Load plan + saved model from localStorage
    useEffect(() => {
        try {
            const savedPlan = localStorage.getItem('lastPlanType');
            if (savedPlan === 'FREE' || savedPlan === 'LITE' || savedPlan === 'PRO' || savedPlan === 'ENTERPRISE') {
                setPlanType(savedPlan);
                const ms = computeModelsForPlan(savedPlan);
                setModels(ms);
                setSelectedModel(ms[0]);
            }
            const savedModelId = localStorage.getItem(`selectedModel:${savedPlan !== null && savedPlan !== void 0 ? savedPlan : 'FREE'}`);
            if (savedModelId) {
                const found = computeModelsForPlan(savedPlan !== null && savedPlan !== void 0 ? savedPlan : 'FREE').find(m => m.id === savedModelId);
                if (found)
                    setSelectedModel(found);
            }
        }
        catch (_a) { }
    }, []);
    // Try loading plan from API
    useEffect(() => {
        const loadPlan = async () => {
            try {
                const res = await fetch('/api/subscription', { cache: 'no-store' });
                if (res.ok) {
                    const json = await res.json();
                    const pt = ((json === null || json === void 0 ? void 0 : json.planType) || 'FREE');
                    setPlanType(pt);
                    localStorage.setItem('lastPlanType', pt);
                    const ms = computeModelsForPlan(pt);
                    setModels(ms);
                    // If current selected not in new set, fallback
                    if (!ms.some(m => m.id === selectedModel.id)) {
                        setSelectedModel(ms[0]);
                    }
                }
            }
            catch (_a) { }
        };
        loadPlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleModelSelect = (model) => {
        setSelectedModel(model);
        localStorage.setItem(`selectedModel:${planType}`, model.id);
    };
    const getSpeedIcon = (speed) => {
        switch (speed) {
            case "very-fast": return "⚡⚡⚡";
            case "fast": return "⚡⚡";
            case "medium": return "⚡";
            default: return "🐌";
        }
    };
    const getIntelligenceIcon = (intelligence) => {
        switch (intelligence) {
            case "state-of-the-art": return "🧠🧠🧠";
            case "advanced": return "🧠🧠";
            case "good": return "🧠";
            default: return "💡";
        }
    };
    // Agrupar modelos por categoria - EXATAMENTE como no Kyroia
    const fastModels = models.filter(m => m.category === 'fast');
    const advancedModels = models.filter(m => m.category === 'advanced');
    const reasoningModels = models.filter(m => m.category === 'reasoning');
    const getCategoryLabel = (category) => {
        switch (category) {
            case 'fast': return '⚡ Modelos Rápidos';
            case 'advanced': return '🧠 Modelos Avançados';
            case 'reasoning': return '🎯 Raciocínio Profundo';
            case 'credit': return '💎 Modelos Premium (Créditos)';
            default: return category;
        }
    };
    const renderModelGroup = (modelList, title) => (<div key={title}>
      <DropdownMenuLabel className="text-text-secondary text-xs font-semibold">
        {title}
      </DropdownMenuLabel>
      {modelList.map((model) => (<DropdownMenuItem key={model.id} onSelect={() => handleModelSelect(model)} className={cn("flex flex-col items-start space-y-2 p-3 cursor-pointer transition-all duration-200", "hover:bg-surface hover:shadow-soft rounded-md mx-1", selectedModel.id === model.id && "bg-primary/10 border-l-2 border-primary")}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="text-primary">{model.icon}</div>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{model.name}</span>
                <span className="text-xs text-text-tertiary">{model.provider}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {model.badge && (<Badge variant={model.badgeVariant} className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                  {model.badge}
                </Badge>)}
              {model.planRequired === 'PRO' && (<Badge variant="outline" className="text-xs border-accent text-accent">
                  PRO
                </Badge>)}
            </div>
          </div>
          
          <p className="text-xs text-text-secondary leading-relaxed">{model.description}</p>
          
          <div className="flex items-center justify-between w-full text-xs">
            <div className="flex items-center space-x-3">
              <span title="Velocidade" className="flex items-center space-x-1">
                <span>{getSpeedIcon(model.speed)}</span>
              </span>
              <span title="Inteligência" className="flex items-center space-x-1">
                <span>{getIntelligenceIcon(model.intelligence)}</span>
              </span>
              <span title="Custo" className="font-mono text-text-secondary">{model.cost}</span>
            </div>
            <div className="flex items-center space-x-2 text-text-tertiary">
              <span className="text-xs">
                {model.maxTokens >= 1000000
                ? `${(model.maxTokens / 1000000).toFixed(1)}M`
                : model.maxTokens >= 1000
                    ? `${(model.maxTokens / 1000).toFixed(0)}K`
                    : `${model.maxTokens}`} tokens
              </span>
              {model.features.includes('Vision') && <span title="Suporta imagens">🖼️</span>}
              {model.features.includes('Function Calling') && <span title="Suporta ferramentas">🔧</span>}
              {model.planRequired !== 'FREE' && <span title="Consome créditos">💳</span>}
            </div>
          </div>
        </DropdownMenuItem>))}
      <DropdownMenuSeparator className="my-2"/>
    </div>);
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[240px] justify-between bg-card hover:bg-card-hover 
                     border-border hover:border-primary/50 shadow-soft hover:shadow-soft-md
                     text-text-primary transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="text-primary">{selectedModel.icon}</div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedModel.name}</span>
              <span className="text-xs text-text-secondary">{selectedModel.provider}</span>
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] bg-card border-border shadow-soft-lg">
        <div className="p-2">
          <DropdownMenuLabel className="text-text-primary font-semibold text-base">
            🤖 Selecione um Modelo de IA
          </DropdownMenuLabel>
          <p className="text-xs text-text-secondary mt-1 mb-3">
            Escolha o modelo ideal para sua tarefa
          </p>
          <DropdownMenuSeparator className="bg-border"/>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {fastModels.length > 0 && renderModelGroup(fastModels, getCategoryLabel('fast'))}
          {advancedModels.length > 0 && renderModelGroup(advancedModels, getCategoryLabel('advanced'))}
          {reasoningModels.length > 0 && renderModelGroup(reasoningModels, getCategoryLabel('reasoning'))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtc2VsZWN0b3IuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kZWwtc2VsZWN0b3IudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQ0wsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLHFCQUFxQixFQUNyQixtQkFBbUIsR0FDcEIsTUFBTSwrQkFBK0IsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUF5QixNQUFNLGNBQWMsQ0FBQTtBQUNyRyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxjQUFjLEVBQWdDLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFvQi9HLDBEQUEwRDtBQUMxRCxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQW1CLEVBQVcsRUFBRTtJQUN2RCxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7UUFDbkIsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7WUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUcsQ0FBQTtRQUMvRSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssTUFBTTtZQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRyxDQUFBO1FBQ2pFLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFT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