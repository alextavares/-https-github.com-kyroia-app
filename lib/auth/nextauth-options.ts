import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.warn("[auth] GOOGLE_CLIENT_ID/SECRET não configurados. Google OAuth estará indisponível.");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: googleClientId || "missing",
      clientSecret: googleClientSecret || "missing",
      allowDangerousEmailAccountLinking: false,
      checks: ["state"],
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      // Retornar boolean explicitamente para lint amigável
      return true;
    },
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google") {
        (token as Record<string, unknown>).provider = "google";
      }
      if (profile && typeof profile === "object") {
        const p = profile as { name?: string; picture?: string };
        token.name = token.name ?? p.name ?? token.name;
        (token as Record<string, unknown>).picture =
          (token as Record<string, unknown>).picture ?? p.picture ?? (token as Record<string, unknown>).picture;
      }
      if (user) {
        token.sub = token.sub ?? user.id;
        token.email = token.email ?? user.email ?? undefined;
        token.name = token.name ?? user.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // session.user.email normalmente é string; proteger contra undefined
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = ((token as Record<string, unknown>).picture as string) ?? session.user.image;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    },
  },
  // pages: { signIn: "/auth/signin" },
  // debug: process.env.NODE_ENV === "development",
};