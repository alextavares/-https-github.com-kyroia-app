import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import AppleProvider from "next-auth/providers/apple";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
const providers = [];
// Only add OAuth providers if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here") {
    providers.push(GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }));
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET &&
    process.env.GITHUB_ID !== "your-github-client-id") {
    providers.push(GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
    }));
}
// Microsoft/Azure AD provider
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID) {
    providers.push(AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
    }));
}
// Apple provider
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
    providers.push(AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
    }));
}
// Always include credentials provider
providers.push(CredentialsProvider({
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
            // Nosso schema armazena o hash em `password` (String?)
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
}));
// Removido adapter de banco temporariamente para usar JWT-only e destravar login social
// Mantemos a função comentada como referência para quando reativarmos o PrismaAdapter.
// const customPrismaAdapter = {
//   ...PrismaAdapter(prisma),
//   async createUser(user: any) {
//     const { image, emailVerified, ...userData } = user
//     return await prisma.user.create({
//       data: {
//         name: userData.name,
//         email: userData.email,
//         profileImage: image, // Map image to profileImage
//         // Remove emailVerified as it's not in our schema
//       },
//     })
//   },
// }
export const authOptions = {
    // adapter: customPrismaAdapter, // desabilitado temporariamente (JWT-only)
    providers,
    session: {
        strategy: "jwt", // usar JWT para liberar login sem dependência de tabelas NextAuth
        maxAge: 7 * 24 * 60 * 60, // 7 dias
        updateAge: 24 * 60 * 60, // 24 horas
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async session({ session, token }) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (token) {
                const t = token;
                const safeUser = {
                    id: t.sub || t.id || ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id) || "",
                    email: t.email || ((_b = session.user) === null || _b === void 0 ? void 0 : _b.email) || "",
                    name: (_e = ((_c = t.name) !== null && _c !== void 0 ? _c : (_d = session.user) === null || _d === void 0 ? void 0 : _d.name)) !== null && _e !== void 0 ? _e : null,
                    image: (_h = ((_f = t.picture) !== null && _f !== void 0 ? _f : (_g = session.user) === null || _g === void 0 ? void 0 : _g.image)) !== null && _h !== void 0 ? _h : null,
                };
                session.user = Object.assign(Object.assign({}, (session.user || {})), safeUser);
            }
            return session;
        },
        async jwt({ token, user, profile }) {
            if (user) {
                const u = user;
                token.id = u.id;
                token.email = u.email;
                token.name = u.name;
            }
            if (profile && typeof profile === "object") {
                const p = profile;
                if (p.picture) {
                    ;
                    token.picture = p.picture;
                }
            }
            return token;
        },
        async signIn() {
            try {
                return true;
            }
            catch (error) {
                console.error('SignIn callback error:', error);
                return false;
            }
        },
        async redirect({ url, baseUrl }) {
            // Garantir redirect para /dashboard após sucesso
            try {
                const u = new URL(url, baseUrl);
                if (u.origin === baseUrl)
                    return u.toString();
            }
            catch (_a) { }
            return `${baseUrl}/dashboard`;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: false
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxtQkFBbUIsTUFBTSxpQ0FBaUMsQ0FBQTtBQUNqRSxPQUFPLGNBQWMsTUFBTSw0QkFBNEIsQ0FBQTtBQUN2RCxPQUFPLGNBQWMsTUFBTSw0QkFBNEIsQ0FBQTtBQUN2RCxPQUFPLGVBQWUsTUFBTSw4QkFBOEIsQ0FBQTtBQUMxRCxPQUFPLGFBQWEsTUFBTSwyQkFBMkIsQ0FBQTtBQUNyRCxzREFBc0Q7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUE7QUFFN0IsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO0FBRXBCLHlEQUF5RDtBQUN6RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7SUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSyx1QkFBdUI7SUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsS0FBSyw0QkFBNEIsRUFBRSxDQUFDO0lBQ2xFLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtRQUN0QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7S0FDL0MsQ0FBQyxDQUFDLENBQUE7QUFDTCxDQUFDO0FBRUQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7SUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUssdUJBQXVCLEVBQUUsQ0FBQztJQUN0RCxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxT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