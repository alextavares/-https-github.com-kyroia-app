import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {
                    return null;
                }
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });
                    if (!user || !user.password) {
                        return null;
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                }
                catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id || token.sub;
                session.user.email = token.email;
                session.user.name = token.name;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async redirect({ url, baseUrl }) {
            return `${baseUrl}/dashboard`;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true // Enable debug to see more detailed errors
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1zaW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdXRoLXNpbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLG1CQUFtQixNQUFNLGlDQUFpQyxDQUFBO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBRTdCLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBb0I7SUFDMUMsU0FBUyxFQUFFO1FBQ1QsbUJBQW1CLENBQUM7WUFDbEIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsV0FBVyxFQUFFO2dCQUNYLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtnQkFDeEMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO2FBQ2xEO1lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXO2dCQUN6QixJQUFJLENBQUMsQ0FBQSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsS0FBSyxDQUFBLElBQUksQ0FBQyxDQUFBLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxRQUFRLENBQUEsRUFBRSxDQUFDO29CQUNsRCxPQUFPLElBQUksQ0FBQTtnQkFDYixDQUFDO2dCQUVELElBQUksQ0FBQztvQkFDSCxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO3dCQUN4QyxLQUFLLEVBQUU7NEJBQ0wsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLO3lCQUN6QjtxQkFDRixDQUFDLENBQUE7b0JBRUYsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDNUIsT0FBTyxJQUFJLENBQUE7b0JBQ2IsQ0FBQztvQkFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQzFDLFdBQVcsQ0FBQyxRQUFRLEVBQ3BCLElBQUksQ0FBQyxRQUFRLENBQ2QsQ0FBQTtvQkFFRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQ3JCLE9BQU8sSUFBSSxDQUFBO29CQUNiLENBQUM7b0JBRUQsT0FBTzt3QkFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO3dCQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7cUJBQ2hCLENBQUE7Z0JBQ0gsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFBO29CQUNuQyxPQUFPLElBQUksQ0FBQTtnQkFDYixDQUFDO1lBQ0gsQ0FBQztTQUNGLENBQUM7S0FDSDtJQUNELE9BQU8sRUFBRTtRQUNQLFFBQVEsRUFBRSxLQUFLO1FBQ2YsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxTQUFTO0tBQ3BDO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsTUFBTSxFQUFFLGNBQWM7S0FDdkI7SUFDRCxTQUFTLEVBQUU7UUFDVCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUM5QixJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLEdBQUksQ0FBQTtnQkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQU0sQ0FBQTtnQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUssQ0FBQTtZQUNqQyxDQUFDO1lBQ0QsT0FBTyxPQUFPLENBQUE7UUFDaEIsQ0FBQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ3ZCLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsS0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBO2dCQUNsQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7Z0JBQ3hCLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtZQUN4QixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7WUFDN0IsT0FBTyxHQUFHLE9BQU8sWUFBWSxDQUFBO1FBQy9CLENBQUM7S0FDRjtJQUNELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWU7SUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQywyQ0FBMkM7Q0FDeEQsQ0FBQSJ9