import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma),
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
            email: user?.email,
            name: user?.name
          });

          const email = user.email?.toLowerCase();
          if (!email) return false;

          // Enforce: User MUST exist in our DB
          const dbUser = await prisma.user.findFirst({
            where: { email },
          });

          if (!dbUser) {
            console.warn(`[Auth] Access Denied: Email ${email} not found in database.`);
            return false; 
          }

          console.log(`[Auth] Access Granted: User ${email} matched to DB ID ${dbUser.id}`);
        }
        return true; 
      } catch (error) {
        console.error("[Auth] CRITICAL ERROR in signIn callback:", error);
        return false; // Deny on error for security
      }
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // If the user came from Azure AD (or any provider), try to find them in OUR db by email
        if (user.email) {
          const dbUser = await prisma.user.findFirst({
            where: { email: user.email },
          });

          if (dbUser) {
            console.log(`[Auth] Linked Azure AD user ${user.email} to DB User ID ${dbUser.id}`);
            token.id = dbUser.id; // SWAP the String ID for the Integer ID
          }
        }
      }
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
