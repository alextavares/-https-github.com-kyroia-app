"use client";
import { useRouter } from "next/navigation";
import { ToolCard } from "./tool-card";
import { MessageSquare, Image, Video, FileText } from "lucide-react";
const tools = [
    {
        id: "chat",
        title: "Chat com IA",
        description: "Converse com modelos avançados de IA como GPT-4, Claude e outros",
        icon: <MessageSquare className="h-8 w-8"/>,
        href: "/dashboard/chat",
        badge: "Popular",
        badgeVariant: "default",
        preview: "gradient"
    },
    {
        id: "image-generation",
        title: "Geração de Imagens",
        description: "Crie imagens incríveis com DALL-E 3 e outros modelos",
        icon: <Image className="h-8 w-8"/>,
        href: "/dashboard/images",
        badge: "Em breve",
        badgeVariant: "secondary",
        disabled: true
    },
    {
        id: "video-transcription",
        title: "Transcrição de Vídeo",
        description: "Transcreva vídeos e gere legendas automaticamente",
        icon: <Video className="h-8 w-8"/>,
        href: "/dashboard/transcribe",
        badge: "Em breve",
        badgeVariant: "secondary",
        disabled: true
    },
    {
        id: "document-analysis",
        title: "Análise de Documentos",
        description: "Analise PDFs e documentos com IA",
        icon: <FileText className="h-8 w-8"/>,
        href: "/dashboard/documents",
        badge: "Em breve",
        badgeVariant: "secondary",
        disabled: true
    },
    {
        id: "video-generation",
        title: "Gerar Vídeo com Base em Imagem",
        description: "Gere vídeos com base em uma imagem",
        icon: <Video className="h-8 w-8"/>,
        href: "/dashboard/video-generation",
        badge: "Em breve",
        badgeVariant: "secondary",
        disabled: true
    }
];
export function FeatureGrid() {
    const router = useRouter();
    const handleToolClick = (href) => {
        router.push(href);
    };
    return (<div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
      {tools.map((tool, index) => (<div key={tool.id} className="flex-shrink-0 w-72">
          <ToolCard title={tool.title} description={tool.description} icon={tool.icon} badge={tool.badge} badgeVariant={tool.badgeVariant} onClick={() => handleToolClick(tool.href)} disabled={tool.disabled} preview={tool.preview}/>
        </div>))}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZS1ncmlkLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZlYXR1cmUtZ3JpZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDdEMsT0FBTyxFQUNMLGFBQWEsRUFDYixLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFTVCxNQUFNLGNBQWMsQ0FBQTtBQUVyQixNQUFNLEtBQUssR0FBRztJQUNaO1FBQ0UsRUFBRSxFQUFFLE1BQU07UUFDVixLQUFLLEVBQUUsYUFBYTtRQUNwQixXQUFXLEVBQUUsa0VBQWtFO1FBQy9FLElBQUksRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFHO1FBQzNDLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsWUFBWSxFQUFFLFNBQWtCO1FBQ2hDLE9BQU8sRUFBRSxVQUFVO0tBQ3BCO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsa0JBQWtCO1FBQ3RCLEtBQUssRUFBRSxvQkFBb0I7UUFDM0IsV0FBVyxFQUFFLHNEQUFzRDtRQUNuRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLEtBQUssRUFBRSxzQkFBc0I7UUFDN0IsV0FBVyxFQUFFLG1EQUFtRDtRQUNoRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsbUJBQW1CO1FBQ3ZCLEtBQUssRUFBRSx1QkFBdUI7UUFDOUIsV0FBVyxFQUFFLGtDQUFrQztRQUMvQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUN0QyxJQUFJLEVBQUUsc0JBQXNCO1FBQzVCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsa0JBQWtCO1FBQ3RCLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsV0FBVyxFQUFFLG9DQUFvQztRQUNqRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0NBQ0YsQ0FBQTtBQUVELE1BQU0sVUFBVSxXQUFXO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFBO0lBRTFCLE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNuQixDQUFDLENBQUE7SUFFRCxPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdEQUFnRCxDQUM3RDtNQUFBLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQzFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQy9DO1VBQUEsQ0FBQyxRQUFRLENBQ1AsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNsQixXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQzlCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDaEIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNsQixZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQ2hDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDMUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUN4QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBRTFCO1FBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFDLENBQ0o7SUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUE7QUFDSCxDQUFDIn0=