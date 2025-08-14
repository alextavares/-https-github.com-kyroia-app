"use client";
import { Briefcase, User, GraduationCap } from 'lucide-react';
const usageTypes = [
    {
        id: 'TRABALHO',
        name: 'Trabalho',
        description: 'Para uso profissional e empresarial',
        icon: Briefcase,
        gradient: 'from-blue-500 to-blue-600'
    },
    {
        id: 'USO_PESSOAL',
        name: 'Uso Pessoal',
        description: 'Para projetos pessoais e hobbies',
        icon: User,
        gradient: 'from-green-500 to-green-600'
    },
    {
        id: 'ESCOLA',
        name: 'Escola',
        description: 'Para estudos e atividades acadêmicas',
        icon: GraduationCap,
        gradient: 'from-purple-500 to-purple-600'
    }
];
export default function UsageTypeStep({ selectedType, onSelect }) {
    return (<div className="space-y-4">
      {usageTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (<button key={type.id} onClick={() => onSelect(type.id)} className={`
              w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
              hover:shadow-lg hover:scale-[1.02]
              ${isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50'}
            `}>
            <div className="flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-lg bg-gradient-to-br ${type.gradient} 
                flex items-center justify-center flex-shrink-0
              `}>
                <Icon className="w-6 h-6 text-white"/>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {type.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
              </div>

              {isSelected && (<div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"/>
                </div>)}
            </div>
          </button>);
        })}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNhZ2VUeXBlU3RlcC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2FnZVR5cGVTdGVwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFPN0QsTUFBTSxVQUFVLEdBQUc7SUFDakI7UUFDRSxFQUFFLEVBQUUsVUFBVTtRQUNkLElBQUksRUFBRSxVQUFVO1FBQ2hCLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsMkJBQTJCO0tBQ3RDO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsYUFBYTtRQUNqQixJQUFJLEVBQUUsYUFBYTtRQUNuQixXQUFXLEVBQUUsa0NBQWtDO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLDZCQUE2QjtLQUN4QztJQUNEO1FBQ0UsRUFBRSxFQUFFLFFBQVE7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxzQ0FBc0M7UUFDbkQsSUFBSSxFQUFFLGFBQWE7UUFDbkIsUUFBUSxFQUFFLCtCQUErQjtLQUMxQztDQUNGLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQXNCO0lBQ2xGLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUN4QjtNQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7WUFDdEIsTUFBTSxVQUFVLEdBQUcsWUFBWSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUE7WUFFM0MsT0FBTyxDQUNMLENBQUMsTUFBTSxDQUNMLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDYixPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ2pDLFNBQVMsQ0FBQyxDQUFDOzs7Z0JBR1AsVUFBVTtvQkFDVixDQUFDLENBQUMsdUNBQXVDO29CQUN6QyxDQUFDLENBQUMsK0NBQ0o7YUFDRCxDQUFDLENBRUY7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQ3JDO2NBQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7eURBQzJCLElBQUksQ0FBQyxRQUFROztlQUV2RCxDQUFDLENBQ0E7Z0JBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUN0QztjQUFBLEVBQUUsR0FBRyxDQUVMOztjQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQ3JCO2dCQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyw0Q0FBNEMsQ0FDeEQ7a0JBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNaO2dCQUFBLEVBQUUsRUFBRSxDQUNKO2dCQUFBLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FDMUM7a0JBQUEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUNuQjtnQkFBQSxFQUFFLENBQUMsQ0FDTDtjQUFBLEVBQUUsR0FBRyxDQUVMOztjQUFBLENBQUMsVUFBVSxJQUFJLENBQ2IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtFQUFrRSxDQUMvRTtrQkFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsK0JBQStCLEVBQ2hEO2dCQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FDSDtZQUFBLEVBQUUsR0FBRyxDQUNQO1VBQUEsRUFBRSxNQUFNLENBQUMsQ0FDVixDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQ0o7SUFBQSxFQUFFLEdBQUcsQ0FBQyxDQUNQLENBQUE7QUFDSCxDQUFDIn0=