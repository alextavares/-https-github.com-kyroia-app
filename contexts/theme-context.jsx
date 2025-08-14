// Implementar um Context API para gerenciar o tema
// Deve incluir:
// - Estado do tema atual (light/dark)
// - Função para alternar tema
// - Persistência no localStorage
// - Aplicação das variáveis CSS no :root
// - Hook useTheme para consumir o contexto
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { themes } from '@/lib/themes';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light'); // Padrão agora é light
    useEffect(() => {
        // Carregar tema salvo ou usar light como padrão
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);
    useEffect(() => {
        // Aplicar variáveis CSS
        const root = document.documentElement;
        const themeColors = themes[theme];
        Object.entries(themeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        // Adicionar classe para Tailwind
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Salvar no localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtY29udGV4dC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0aGVtZS1jb250ZXh0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtREFBbUQ7QUFDbkQsZ0JBQWdCO0FBQ2hCLHNDQUFzQztBQUN0Qyw4QkFBOEI7QUFDOUIsaUNBQWlDO0FBQ2pDLHlDQUF5QztBQUN6QywyQ0FBMkM7QUFFM0MsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUN0RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBU3JDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBK0IsU0FBUyxDQUFDLENBQUE7QUFFM0UsTUFBTSxVQUFVLGFBQWEsQ0FBQyxFQUFFLFFBQVEsRUFBaUM7SUFDdkUsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQVEsT0FBTyxDQUFDLENBQUEsQ0FBQyx1QkFBdUI7SUFFMUUsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLGdEQUFnRDtRQUNoRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBVSxDQUFBO1FBQ3pELElBQUksVUFBVSxFQUFFLENBQUM7WUFDZixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDdEIsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYix3QkFBd0I7UUFDeEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQTtRQUNyQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1lBQ25ELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDM0MsQ0FBQyxDQUFDLENBQUE7UUFFRixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXpCLHlCQUF5QjtRQUN6QixZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUN0QyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBRVgsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFO1FBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDdkQsQ0FBQyxDQUFBO0lBRUQsT0FBTyxDQUNMLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUNuRDtNQUFBLENBQUMsUUFBUSxDQUNYO0lBQUEsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQ3pCLENBQUE7QUFDSCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTtJQUMzQixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDeEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO0lBQy9ELENBQUM7SUFDRCxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDLENBQUEifQ==