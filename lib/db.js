var _a;
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });
};
export const prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
// Test database connection on startup
prisma.$connect()
    .then(() => {
    console.log('✅ Database connected successfully');
})
    .catch((error) => {
    var _a;
    console.error('❌ Database connection failed:', error);
    console.error('DATABASE_URL:', (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/:[^:@]+@/, ':***@'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTdDLE1BQU0sZUFBZSxHQUFHLFVBRXZCLENBQUE7QUFFRCxNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRTtJQUNqQyxPQUFPLElBQUksWUFBWSxDQUFDO1FBQ3RCLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO1FBQy9CLFdBQVcsRUFBRTtZQUNYLEVBQUUsRUFBRTtnQkFDRixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO2FBQzlCO1NBQ0Y7S0FDRixDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsTUFBQSxlQUFlLENBQUMsTUFBTSxtQ0FBSSxxQkFBcUIsRUFBRSxDQUFBO0FBRXZFLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFLENBQUM7SUFDMUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDakMsQ0FBQztBQUVELHNDQUFzQztBQUN0QyxNQUFNLENBQUMsUUFBUSxFQUFFO0tBQ2QsSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtBQUNsRCxDQUFDLENBQUM7S0FDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTs7SUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3JELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLE1BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLDBDQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN4RixDQUFDLENBQUMsQ0FBQSJ9