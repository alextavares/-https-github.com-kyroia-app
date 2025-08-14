"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Megaphone, HelpCircle, BarChart3, FileIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
const professionalTemplates = [
    {
        id: "resumo-executivo",
        title: "Resumo Executivo",
        description: "Crie um resumo conciso e impactante que destaque os principais pontos e recomendações",
        icon: <BarChart3 className="h-8 w-8 text-blue-500"/>,
        prompt: "Preciso de um resumo executivo profissional sobre",
        category: "Trabalho"
    },
    {
        id: "comunicado-imprensa",
        title: "Comunicado de Imprensa",
        description: "Elabore um comunicado de imprensa profissional para divulgar notícias importantes",
        icon: <Megaphone className="h-8 w-8 text-green-500"/>,
        prompt: "Crie um comunicado de imprensa profissional sobre",
        category: "Trabalho"
    },
    {
        id: "artigo-suporte",
        title: "Artigo de Suporte",
        description: "Desenvolva artigos de suporte detalhados para orientar os usuários",
        icon: <FileText className="h-8 w-8 text-purple-500"/>,
        prompt: "Escreva um artigo de suporte completo sobre como",
        category: "Trabalho"
    },
    {
        id: "faqs",
        title: "Perguntas Frequentes (FAQs)",
        description: "Compile uma lista de perguntas frequentes e suas respostas detalhadas",
        icon: <HelpCircle className="h-8 w-8 text-orange-500"/>,
        prompt: "Crie uma seção de perguntas frequentes (FAQ) sobre",
        category: "Trabalho"
    },
    {
        id: "resumo-documento",
        title: "Resumo",
        description: "Resuma de forma eficiente conteúdo extenso mantendo os pontos principais",
        icon: <FileIcon className="h-8 w-8 text-indigo-500"/>,
        prompt: "Faça um resumo detalhado e organizado sobre",
        category: "Trabalho"
    }
];
const professionalCategories = [
    { id: "marketing", name: "Marketing", icon: "📢" },
    { id: "juridico", name: "Jurídico", icon: "⚖️" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "operacoes", name: "Operações", icon: "⚙️" },
    { id: "financas", name: "Finanças", icon: "💰" },
    { id: "vendas", name: "Vendas", icon: "📈" },
    { id: "engenharia", name: "Engenharia", icon: "🔧" },
    { id: "conteudo", name: "Criador de Conteúdo", icon: "📝" },
    { id: "rh", name: "Recursos Humanos", icon: "👥" },
    { id: "outro", name: "Outro...", icon: "📋" }
];
export function ProfessionalTemplates({ className }) {
    const router = useRouter();
    const handleTemplateClick = (template) => {
        // Redireciona para o chat com o prompt pré-preenchido
        const encodedPrompt = encodeURIComponent(template.prompt);
        router.push(`/dashboard/chat?prompt=${encodedPrompt}`);
    };
    const handleCategoryClick = (category) => {
        // Redireciona para o chat com contexto da categoria
        const prompt = `Como especialista em ${category.name.toLowerCase()}, me ajude com:`;
        const encodedPrompt = encodeURIComponent(prompt);
        router.push(`/dashboard/chat?prompt=${encodedPrompt}`);
    };
    return (<div className={`space-y-8 ${className}`}>
      {/* Categorias Profissionais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Conte para gente de qual time você faz parte...</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {professionalCategories.map((category) => (<Button key={category.id} variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors text-white" onClick={() => handleCategoryClick(category)}>
              <span className="text-2xl">{category.icon}</span>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Button>))}
        </div>
      </div>

      {/* Templates Profissionais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Templates Profissionais</h3>
            <p className="text-sm text-gray-400">
              Modelos prontos para acelerar seu trabalho
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex bg-purple-600 text-white">
            Trabalho
          </Badge>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {professionalTemplates.map((template) => (<Card key={template.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group bg-gray-800/50 border-gray-700 hover:bg-gray-700/50" onClick={() => handleTemplateClick(template)}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                    {template.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm leading-tight text-white">
                      {template.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>))}
        </div>
      </div>

      {/* Botão de Chat Personalizado */}
      <div className="flex justify-center">
        <Button onClick={() => router.push('/dashboard/chat')} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4"/>
          <span>Iniciar Chat Personalizado</span>
        </Button>
      </div>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmVzc2lvbmFsLXRlbXBsYXRlcy5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm9mZXNzaW9uYWwtdGVtcGxhdGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUE7QUFDM0MsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUNMLFFBQVEsRUFDUixTQUFTLEVBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVCxRQUFRLEVBQ1IsSUFBSSxFQUNMLE1BQU0sY0FBYyxDQUFBO0FBQ3JCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUUvQyxNQUFNLHFCQUFxQixHQUFHO0lBQzVCO1FBQ0UsRUFBRSxFQUFFLGtCQUFrQjtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSx1RkFBdUY7UUFDcEcsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRztRQUNyRCxNQUFNLEVBQUUsbURBQW1EO1FBQzNELFFBQVEsRUFBRSxVQUFVO0tBQ3JCO0lBQ0Q7UUFDRSxFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLEtBQUssRUFBRSx3QkFBd0I7UUFDL0IsV0FBVyxFQUFFLG1GQUFtRjtRQUNoRyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFHO1FBQ3RELE1BQU0sRUFBRSxtREFBbUQ7UUFDM0QsUUFBUSxFQUFFLFVBQVU7S0FDckI7SUFDRDtRQUNFLEVBQUUsRUFBRSxnQkFBZ0I7UUFDcEIsS0FBSyxFQUFFLG1CQUFtQjtRQUMxQixXQUFXLEVBQUUsb0VBQW9FO1FBQ2pGLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFT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