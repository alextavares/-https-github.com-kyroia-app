import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
<<<<<<< HEAD
=======
import AppleProvider from "next-auth/providers/apple"
/* eslint-disable @typescript-eslint/no-unused-vars */
>>>>>>> kyroia
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth provider (only if credentials are configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== "" && 
        process.env.GOOGLE_CLIENT_SECRET !== "" ? 
      [GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })] : []),

    // Microsoft Azure AD provider (only if credentials are configured)
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && 
        process.env.AZURE_AD_TENANT_ID &&
        process.env.AZURE_AD_CLIENT_ID !== "" && 
        process.env.AZURE_AD_CLIENT_SECRET !== "" ? 
      [AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
      })] : []),

    // Credentials provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          // Nosso schema armazena o hash em `password` (String?)
          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
<<<<<<< HEAD
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '').replace(/:\d+/, '') : undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '').replace(/:\d+/, '') : undefined
      }
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
=======
)

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

export const authOptions: NextAuthOptions = {
  // adapter: customPrismaAdapter, // desabilitado temporariamente (JWT-only)
  providers,
  session: {
    strategy: "jwt", // usar JWT para liberar login sem dependência de tabelas NextAuth
    maxAge: 7 * 24 * 60 * 60, // 7 dias
    updateAge: 24 * 60 * 60, // 24 horas
>>>>>>> kyroia
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true // Já validado no authorize
      }

      // Para OAuth providers (Google, Microsoft)
      if (!user.email) {
        return false // Email é obrigatório
      }

      try {
        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          // Criar novo usuário com dados do OAuth
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              profileImage: user.image || null,
              planType: "FREE",
              creditBalance: 100, // Créditos iniciais para novos usuários
              onboardingCompleted: false,
              isActive: true
            }
          })
        }

        return true
      } catch (error) {
        console.error("OAuth SignIn Error:", error)
        return false
      }
    },
    
    async session({ session, token }) {
      if (token) {
        type JwtShape = {
          sub?: string
          id?: string
          email?: string
          name?: string | null
          picture?: string | null
        }
        const t = token as unknown as JwtShape
        const safeUser: { id: string; email: string; name: string | null; image: string | null } = {
          id: t.sub || t.id || session.user?.id || "",
          email: t.email || session.user?.email || "",
          name: (t.name ?? session.user?.name) ?? null,
          image: (t.picture ?? session.user?.image) ?? null,
        }
        session.user = { ...(session.user || {}), ...safeUser }
      }
      return session
    },
<<<<<<< HEAD
    
    async jwt({ token, user, account }) {
=======
    async jwt({ token, user, profile }) {
>>>>>>> kyroia
      if (user) {
        const u = user as { id?: string; email?: string; name?: string | null }
        ;(token as Record<string, unknown>).id = u.id
        ;(token as Record<string, unknown>).email = u.email
        ;(token as Record<string, unknown>).name = u.name
      }
      if (profile && typeof profile === "object") {
        const p = profile as { picture?: string | null }
        if (p.picture) {
          ;(token as Record<string, unknown>).picture = p.picture
        }
      }

      // Para OAuth, buscar dados atualizados do usuário
      if (account?.provider !== "credentials" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.name = dbUser.name
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      
      return token
    },
<<<<<<< HEAD
    
    async redirect({ url, baseUrl }) {
      // Redirecionar para página de migração se houver sessão anônima
      if (url.includes("migrate=true")) {
        return `${baseUrl}/auth/migrate-anonymous`
      }
=======
    async signIn() {
      try {
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Garantir redirect para /dashboard após sucesso
      try {
        const u = new URL(url, baseUrl)
        if (u.origin === baseUrl) return u.toString()
      } catch {}
>>>>>>> kyroia
      return `${baseUrl}/dashboard`
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
}