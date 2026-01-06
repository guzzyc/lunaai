import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user || !user.password) return null;

        // check password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "azure-ad") {
          console.log("[Auth] Azure AD SignIn Initiated", { 
            user: { id: user?.id, email: user?.email, name: user?.name },
            account: { provider: account?.provider, type: account?.type },
            profile: profile ? "Profile data present" : "No profile data"
          });
        }
        return true; // Always allow access
      } catch (error) {
        console.error("[Auth] CRITICAL ERROR in signIn callback (Logged only, allowing access):", error);
        return true; // Fail safe by allowing access even on system error per instruction
      }
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id as number;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
