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
      if (account?.provider === "azure-ad") {
        const email = user.email?.toLowerCase();
        
        // Example 1: Allow everyone from your company domain
        const allowedDomain = "@luna.ai"; 
        
        // Example 2: Allow specific external users
        const allowedEmails = ["partner@example.com", "consultant@gmail.com"];

        // Check if email matches domain OR is in the allowlist
        if (email?.endsWith(allowedDomain) || allowedEmails.includes(email || "")) {
          return true; // Access Granted
        }

        console.log(`Access denied for: ${email}`);
        return false; // Access Denied
      }
      return true;
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
