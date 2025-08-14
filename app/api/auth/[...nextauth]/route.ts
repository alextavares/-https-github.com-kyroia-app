import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Fonte única de verdade: lib/auth.ts (providers, callbacks, pages, secret, etc.)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };