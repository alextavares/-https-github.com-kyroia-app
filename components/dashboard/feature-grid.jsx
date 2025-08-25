"use client";
import { useRouter } from "next/navigation";
import { ToolCard } from "./tool-card";
import { Image, Video, Type } from "lucide-react";
const tools = [
  {
    id: "image-generation",
    title: "Geração de Imagens",
    description: "Produza imagens em vários tamanhos e estilos.",
    icon: <Image className="h-6 w-6" />,
    href: "/dashboard/images",
    badge: "Em breve",
    badgeVariant: "secondary",
    disabled: true,
  },
  {
    id: "video-transcription",
    title: "Transcrever Vídeo",
    description: "Transcreva arquivos de vídeo e gere legendas.",
    icon: <Video className="h-6 w-6" />,
    href: "/dashboard/transcribe",
    badge: "Em breve",
    badgeVariant: "secondary",
    disabled: true,
  },
  {
    id: "text-translation",
    title: "Tradução de Texto",
    description: "Forneça uma tradução especializada, rápida e precisa.",
    icon: <Type className="h-6 w-6" />,
    href: "/dashboard/translate",
    badge: "Em breve",
    badgeVariant: "secondary",
    disabled: true,
  },
  {
    id: "video-edit-from-image",
    title: "Gerar Vídeo com Edição de Imagem",
    description: "Edite e gere vídeos com base em uma imagem.",
    icon: <Video className="h-6 w-6" />,
    href: "/dashboard/video-edit",
    badge: "Em breve",
    badgeVariant: "secondary",
    disabled: true,
  },
];
export function FeatureGrid() {
  const router = useRouter();
  const handleToolClick = (href) => {
    router.push(href);
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          className="h-[8.5rem]"
          title={tool.title}
          description={tool.description}
          icon={tool.icon}
          badge={tool.badge}
          badgeVariant={tool.badgeVariant}
          onClick={() => handleToolClick(tool.href)}
          disabled={tool.disabled}
          preview={tool.preview}
        />
      ))}
    </div>
  );
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZS1ncmlkLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZlYXR1cmUtZ3JpZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDdEMsT0FBTyxFQUNMLGFBQWEsRUFDYixLQUFLLEVBQ0wsS0FBSyxFQUNMLFFBQVEsRUFTVCxNQUFNLGNBQWMsQ0FBQTtBQUVyQixNQUFNLEtBQUssR0FBRztJQUNaO1FBQ0UsRUFBRSxFQUFFLE1BQU07UUFDVixLQUFLLEVBQUUsYUFBYTtRQUNwQixXQUFXLEVBQUUsa0VBQWtFO1FBQy9FLElBQUksRUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFHO1FBQzNDLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsWUFBWSxFQUFFLFNBQWtCO1FBQ2hDLE9BQU8sRUFBRSxVQUFVO0tBQ3BCO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsa0JBQWtCO1FBQ3RCLEtBQUssRUFBRSxvQkFBb0I7UUFDM0IsV0FBVyxFQUFFLHNEQUFzRDtRQUNuRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLEtBQUssRUFBRSxzQkFBc0I7UUFDN0IsV0FBVyxFQUFFLG1EQUFtRDtRQUNoRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsbUJBQW1CO1FBQ3ZCLEtBQUssRUFBRSx1QkFBdUI7UUFDOUIsV0FBVyxFQUFFLGtDQUFrQztRQUMvQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUN0QyxJQUFJLEVBQUUsc0JBQXNCO1FBQzVCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsa0JBQWtCO1FBQ3RCLEtBQUssRUFBRSxnQ0FBZ0M7UUFDdkMsV0FBVyxFQUFFLG9DQUFvQztRQUNqRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRztRQUNuQyxJQUFJLEVBQUUsNkJBQTZCO1FBQ25DLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFlBQVksRUFBRSxXQUFvQjtRQUNsQyxRQUFRLEVBQUUsSUFBSTtLQUNmO0NBQ0YsQ0FBQTtBQUVELE1BQU0sVUFBVSxXQUFXO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFBO0lBRTFCLE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNuQixDQUFDLENBQUE7SUFFRCxPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGdEQUFnRCxDQUM3RDtNQUFBLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQzFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQy9DO1VBQUEsQ0FBQyxRQUFRLENBQ1AsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNsQixXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQzlCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDaEIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNsQixZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQ2hDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDMUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUN4QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBRTFCO1FBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFDLENBQ0o7SUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUE7QUFDSCxDQUFDIn0=
