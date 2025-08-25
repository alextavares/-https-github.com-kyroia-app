import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user data
const mockUsersList = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    role: 'user',
    plan: 'FREE',
    image: null,
  },
  {
    id: '2',
    email: 'premium@example.com',
    password: 'Premium123!@#',
    name: 'Premium User',
    role: 'user',
    plan: 'PRO',
    image: null,
  },
  {
    id: '3',
    email: 'admin@innerai.com',
    password: 'Admin123!@#',
    name: 'Admin User',
    role: 'admin',
    plan: 'ENTERPRISE',
    image: null,
  },
];

// Backwards-compatible exports used by different tests
export const mockUsers = {
  basic: mockUsersList[0],
  pro: mockUsersList[1],
  admin: mockUsersList[2],
  enterprise: mockUsersList[2],
};

export const mockUsersArray = mockUsersList;

// Mock NextAuth configuration for testing
export const mockAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(u => 
          u.email === credentials.email && 
          u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            image: user.image,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Mock session data
export const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    plan: 'FREE',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockSessions = {
  basic: {
    user: {
      id: mockUsersList[0].id,
      email: mockUsersList[0].email,
      name: mockUsersList[0].name,
      role: mockUsersList[0].role,
      plan: mockUsersList[0].plan,
      image: mockUsersList[0].image,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  pro: {
    user: {
      id: mockUsersList[1].id,
      email: mockUsersList[1].email,
      name: mockUsersList[1].name,
      role: mockUsersList[1].role,
      plan: mockUsersList[1].plan,
      image: mockUsersList[1].image,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  enterprise: {
    user: {
      id: mockUsersList[2].id,
      email: mockUsersList[2].email,
      name: mockUsersList[2].name,
      role: mockUsersList[2].role,
      plan: mockUsersList[2].plan,
      image: mockUsersList[2].image,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// Mock auth responses
export const mockAuthResponses = {
  success: {
    url: '/dashboard',
    ok: true,
    error: null,
    status: 200,
  },
  invalidCredentials: {
    url: null,
    ok: false,
    error: 'CredentialsSignin',
    status: 401,
  },
  networkError: {
    url: null,
    ok: false,
    error: 'NetworkError',
    status: 500,
  },
};
