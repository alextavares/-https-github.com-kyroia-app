// Componente para textos com gradiente como no Kyroia
export function GradientText({ children, className = "" }) {
    return (<span className={`
      bg-gradient-to-r from-primary via-secondary to-accent 
      bg-clip-text text-transparent font-bold
      ${className}
    `}>
      {children}
    </span>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhZGllbnQtdGV4dC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJncmFkaWVudC10ZXh0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3REFBd0Q7QUFFeEQsTUFBTSxVQUFVLFlBQVksQ0FBQyxFQUMzQixRQUFRLEVBQ1IsU0FBUyxHQUFHLEVBQUUsRUFJZjtJQUNDLE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O1FBR2IsU0FBUztLQUNaLENBQUMsQ0FDQTtNQUFBLENBQUMsUUFBUSxDQUNYO0lBQUEsRUFBRSxJQUFJLENBQUMsQ0FDUixDQUFBO0FBQ0gsQ0FBQyJ9