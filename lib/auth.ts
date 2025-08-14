import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AzureADProvider from "next-auth/providers/azure-ad"
import AppleProvider from "next-auth/providers/apple"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const providers = []

// Only add OAuth providers if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here") {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET &&
    process.env.GITHUB_ID !== "your-github-client-id") {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }))
}

// Microsoft/Azure AD provider
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && 
    process.env.AZURE_AD_TENANT_ID) {
  providers.push(AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID,
  }))
}

// Apple provider
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(AppleProvider({
    clientId: process.env.APPLE_ID,
    clientSecret: process.env.APPLE_SECRET,
  }))
}

// Always include credentials provider
providers.push(CredentialsProvider({
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
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
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
    async jwt({ token, user, profile }) {
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
      return token
    },
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
      return `${baseUrl}/dashboard`
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false
}