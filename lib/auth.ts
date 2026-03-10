// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const store = await prisma.store.findUnique({ where: { email: credentials.email } });
        if (!store) return null;
        const valid = await bcrypt.compare(credentials.password, store.password);
        if (!valid) return null;
        return { id: store.id, email: store.email, name: store.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.storeId = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).storeId = token.storeId;
      return session;
    },
  },
};
