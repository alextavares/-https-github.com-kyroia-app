import GoogleProvider from "next-auth/providers/google";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!googleClientId || !googleClientSecret) {
    console.warn("[auth] GOOGLE_CLIENT_ID/SECRET não configurados. Google OAuth estará indisponível.");
}
export const authOptions = {
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if ((account === null || account === void 0 ? void 0 : account.provider) === "google") {
                token.provider = "google";
            }
            if (profile && typeof profile === "object") {
                const p = profile;
                token.name = (_b = (_a = token.name) !== null && _a !== void 0 ? _a : p.name) !== null && _b !== void 0 ? _b : token.name;
                token.picture =
                    (_d = (_c = token.picture) !== null && _c !== void 0 ? _c : p.picture) !== null && _d !== void 0 ? _d : token.picture;
            }
            if (user) {
                token.sub = (_e = token.sub) !== null && _e !== void 0 ? _e : user.id;
                token.email = (_g = (_f = token.email) !== null && _f !== void 0 ? _f : user.email) !== null && _g !== void 0 ? _g : undefined;
                token.name = (_j = (_h = token.name) !== null && _h !== void 0 ? _h : user.name) !== null && _j !== void 0 ? _j : undefined;
            }
            return token;
        },
        async session({ session, token }) {
            var _a, _b;
            // session.user.email normalmente é string; proteger contra undefined
            if (session.user) {
                session.user.name = (_a = token.name) !== null && _a !== void 0 ? _a : session.user.name;
                session.user.image = (_b = token.picture) !== null && _b !== void 0 ? _b : session.user.image;
                if (typeof token.email === "string") {
                    session.user.email = token.email;
                }
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/"))
                return `${baseUrl}${url}`;
            try {
                const target = new URL(url);
                const base = new URL(baseUrl);
                if (target.origin === base.origin)
                    return url;
            }
            catch (_a) {
                // ignore
            }
            return baseUrl;
        },
    },
    // pages: { signIn: "/auth/signin" },
    // debug: process.env.NODE_ENV === "development",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dGF1dGgtb3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5leHRhdXRoLW9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxjQUFjLE1BQU0sNEJBQTRCLENBQUM7QUFFeEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBaUIsQ0FBQztBQUNyRCxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQXFCLENBQUM7QUFDN0QsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFFbkQsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO0FBQ3JHLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQW9CO0lBQzFDLE1BQU0sRUFBRSxjQUFjO0lBQ3RCLFNBQVMsRUFBRTtRQUNULGNBQWMsQ0FBQztZQUNiLFFBQVEsRUFBRSxjQUFjLElBQUksU0FBUztZQUNyQyxZQUFZLEVBQUUsa0JBQWtCLElBQUksU0FBUztZQUM3QyxpQ0FBaUMsRUFBRSxLQUFLO1lBQ3hDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQztTQUNsQixDQUFDO0tBQ0g7SUFDRCxPQUFPLEVBQUU7UUFDUCxRQUFRLEVBQUUsS0FBSztLQUNoQjtJQUNELFNBQVMsRUFBRTtRQUNULEtBQUssQ0FBQyxNQUFNO1lBQ1YscURBQXFEO1lBQ3JELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7O1lBQ3pDLElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsUUFBUSxNQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNsQyxLQUFpQyxD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