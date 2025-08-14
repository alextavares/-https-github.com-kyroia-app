var _a;
import { PrismaClient } from "@prisma/client";
// Singleton para evitar múltiplas instâncias em dev (HMR)
export const prisma = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : new PrismaClient({
    log: ["error", "warn"],
});
if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}
// Alias de compatibilidade: alguns trechos antigos usam `paymentTransaction`
// No schema atual o modelo é `Payment`. Mantemos um alias em runtime.
// @ts-ignore – adicionamos a propriedade dinamicamente para compatibilidade
prisma.paymentTransaction = prisma.payment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpc21hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJpc21hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFPOUMsMERBQTBEO0FBQzFELE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FDakIsTUFBQSxVQUFVLENBQUMsWUFBWSxtQ0FDdkIsSUFBSSxZQUFZLENBQUM7SUFDZixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO0NBQ3ZCLENBQUMsQ0FBQztBQUVMLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFLENBQUM7SUFDMUMsVUFBVSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDbkMsQ0FBQztBQUVELDZFQUE2RTtBQUM3RSxzRUFBc0U7QUFDdEUsNEVBQTRFO0FBQzNFLE1BQWMsQ0FBQyxrQkFBa0IsR0FBSSxNQUFjLENBQUMsT0FBTyxDQUFDIn0=