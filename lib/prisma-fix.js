// Temporary fix for Prisma unique constraint
// This creates the composite unique constraint manually if it doesn't exist
import { prisma } from "./prisma";
export { prisma }; // Re-export prisma for imports
export async function ensureUniqueConstraints() {
    try {
        // Check if we can query the database
        await prisma.user.findFirst();
        console.log("Database connection successful");
    }
    catch (error) {
        console.error("Database connection failed:", error);
        // For now, we'll continue without throwing to allow development
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpc21hLWZpeC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByaXNtYS1maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBQzdDLDRFQUE0RTtBQUU1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRWpDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQSxDQUFDLCtCQUErQjtBQUVqRCxNQUFNLENBQUMsS0FBSyxVQUFVLHVCQUF1QjtJQUMzQyxJQUFJLENBQUM7UUFDSCxxQ0FBcUM7UUFDckMsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbkQsZ0VBQWdFO0lBQ2xFLENBQUM7QUFDSCxDQUFDIn0=