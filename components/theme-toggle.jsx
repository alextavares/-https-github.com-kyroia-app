// Criar um botão bonito para alternar entre temas
// Usar ícones de sol/lua
// Adicionar animação suave na transição
// Posicionar no header ou sidebar
'use client';
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon } from 'lucide-react';
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (<button onClick={toggleTheme} className="relative p-2 rounded-lg bg-surface hover:bg-surface-hover 
                 border border-border hover:border-border-hover
                 shadow-soft hover:shadow-soft-md
                 transition-all duration-300 group" aria-label="Toggle theme">
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 transform transition-all duration-300
                     ${theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'}`} size={20}/>
        <Moon className={`absolute inset-0 transform transition-all duration-300
                     ${theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'}`} size={20}/>
      </div>
    </button>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtdG9nZ2xlLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRoZW1lLXRvZ2dsZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsa0RBQWtEO0FBQ2xELHlCQUF5QjtBQUN6Qix3Q0FBd0M7QUFDeEMsa0NBQWtDO0FBRWxDLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUV4QyxNQUFNLFVBQVUsV0FBVztJQUN6QixNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFBO0lBRXpDLE9BQU8sQ0FDTCxDQUFDLE1BQU0sQ0FDTCxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FDckIsU0FBUyxDQUFDOzs7bURBR21DLENBQzdDLFVBQVUsQ0FBQyxjQUFjLENBRXpCO01BQUEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUMvQjtRQUFBLENBQUMsR0FBRyxDQUNGLFNBQVMsQ0FBQyxDQUFDO3VCQUNFLEtBQUssS0FBSyxPQUFPO1lBQ2pCLENBQUMsQ0FBQyxnQ0FBZ0M7WUFDbEMsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FDL0MsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBRVg7UUFBQSxDQUFDLElBQUksQ0FDSCxTQUFTLENBQUMsQ0FBQzt1QkFDRSxLQUFLLEtBQUssTUFBTTtZQUNoQixDQUFDLENBQUMsZ0NBQWdDO1lBQ2xDLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQ2hELElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUViO01BQUEsRUFBRSxHQUFHLENBQ1A7SUFBQSxFQUFFLE1BQU0sQ0FBQyxDQUNWLENBQUE7QUFDSCxDQUFDIn0=