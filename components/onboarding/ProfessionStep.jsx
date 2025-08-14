"use client";
import { Megaphone, Scale, Palette, Settings, DollarSign, TrendingUp, Code2, Video, Users } from 'lucide-react';
const professions = [
    {
        id: 'marketing',
        name: 'Marketing',
        icon: Megaphone,
        gradient: 'from-pink-500 to-rose-600'
    },
    {
        id: 'juridico',
        name: 'Jurídico',
        icon: Scale,
        gradient: 'from-blue-600 to-indigo-700'
    },
    {
        id: 'design',
        name: 'Design',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-600'
    },
    {
        id: 'operacoes',
        name: 'Operações',
        icon: Settings,
        gradient: 'from-gray-600 to-gray-700'
    },
    {
        id: 'financas',
        name: 'Finanças',
        icon: DollarSign,
        gradient: 'from-green-500 to-emerald-600'
    },
    {
        id: 'vendas',
        name: 'Vendas',
        icon: TrendingUp,
        gradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'engenharia',
        name: 'Engenharia',
        icon: Code2,
        gradient: 'from-blue-500 to-cyan-600'
    },
    {
        id: 'criador-conteudo',
        name: 'Criador de Conteúdo',
        icon: Video,
        gradient: 'from-violet-500 to-purple-600'
    },
    {
        id: 'recursos-humanos',
        name: 'Recursos Humanos',
        icon: Users,
        gradient: 'from-teal-500 to-green-600'
    }
];
export default function ProfessionStep({ selectedProfession, onSelect }) {
    return (<div className="grid grid-cols-2 gap-3">
      {professions.map((profession) => {
            const Icon = profession.icon;
            const isSelected = selectedProfession === profession.id;
            return (<button key={profession.id} onClick={() => onSelect(profession.id)} className={`
              p-4 rounded-xl border-2 transition-all duration-200 text-center
              hover:shadow-md hover:scale-[1.02]
              ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/50'}
            `}>
            <div className={`
              w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${profession.gradient} 
              flex items-center justify-center
            `}>
              <Icon className="w-6 h-6 text-white"/>
            </div>
            
            <h3 className="text-sm font-medium text-foreground">
              {profession.name}
            </h3>

            {isSelected && (<div className="mt-2 w-4 h-4 mx-auto bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"/>
              </div>)}
          </button>);
        })}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZmVzc2lvblN0ZXAuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZmVzc2lvblN0ZXAudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsVUFBVSxFQUNWLFVBQVUsRUFDVixLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTixNQUFNLGNBQWMsQ0FBQTtBQU9yQixNQUFNLFdBQVcsR0FBRztJQUNsQjtRQUNFLEVBQUUsRUFBRSxXQUFXO1FBQ2YsSUFBSSxFQUFFLFdBQVc7UUFDakIsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsMkJBQTJCO0tBQ3RDO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsVUFBVTtRQUNkLElBQUksRUFBRSxVQUFVO1FBQ2hCLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLDZCQUE2QjtLQUN4QztJQUNEO1FBQ0UsRUFBRSxFQUFFLFFBQVE7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLDZCQUE2QjtLQUN4QztJQUNEO1FBQ0UsRUFBRSxFQUFFLFdBQVc7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSwyQkFBMkI7S0FDdEM7SUFDRDtRQUNFLEVBQUUsRUFBRSxVQUFVO1FBQ2QsSUFBSSxFQUFFLFVBQVU7UUFDaEIsSUFBSSxFQUFFLFVBQVU7UUFDaEIsUUFBUSxFQUFFLCtCQUErQjtLQUMxQztJQUNEO1FBQ0UsRUFBRSxFQUFFLFFBQVE7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxVQUFVO1FBQ2hCLFFBQVEsRUFBRSw0QkFBNEI7S0FDdkM7SUFDRDtRQUNFLEVBQUUsRUFBRSxZQUFZO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLDJCQUEyQjtLQUN0QztJQUNEO1FBQ0UsRUFBRSxFQUFFLGtCQUFrQjtRQUN0QixJQUFJLEVBQUUscUJBQXFCO1FBQzNCLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLCtCQUErQjtLQUMxQztJQUNEO1FBQ0UsRUFBRSxFQUFFLGtCQUFrQjtRQUN0QixJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLElBQUksRUFBRSxLQUFLO1FBQ1gsUUFBUSxFQUFFLDRCQUE0QjtLQUN2QztDQUNGLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWMsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBdUI7SUFDMUYsT0FBTyxDQUNMLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FDckM7TUFBQSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFBO1lBQzVCLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixLQUFLLFVBQVUsQ0FBQyxFQUFFLENBQUE7WUFFdkQsT0FBTyxDQUNMLENBQUMsTUFBTSxDQUNMLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FDbkIsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN2QyxTQUFTLENBQUMsQ0FBQzs7O2dCQUdQLFVBQVU7b0JBQ1YsQ0FBQyxDQUFDLHVDQUF1QztvQkFDekMsQ0FBQyxDQUFDLCtDQUNKO2FBQ0QsQ0FBQyxDQUVGO1lBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0VBQ3dDLFVBQVUsQ0FBQyxRQUFROzthQUUxRSxDQUFDLENBQ0E7Y0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQ3RDO1lBQUEsRUFBRSxHQUFHLENBRUw7O1lBQUEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHFDQUFxQyxDQUNqRDtjQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FDbEI7WUFBQSxFQUFFLEVBQUUsQ0FFSjs7WUFBQSxDQUFDLFVBQVUsSUFBSSxDQUNiLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQywrRUFBK0UsQ0FDNUY7Z0JBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLCtCQUErQixFQUNoRDtjQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FDSDtVQUFBLEVBQUUsTUFBTSxDQUFDLENBQ1YsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUNKO0lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyJ9