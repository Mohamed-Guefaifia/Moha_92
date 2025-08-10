import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";
import type { Session, User as NextAuthUser } from "next-auth";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        const result: NextAuthUser & { role: string } = {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
        return result;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWT & { id?: string; role?: string };
      if (user && "id" in user) {
        t.id = (user as { id?: string }).id;
      }
      if (user && "role" in user) {
        t.role = (user as { role?: string }).role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as JWT & { id?: string; role?: string };
      const s = session as Session & { user: { id?: string; role?: string } };
      if (s.user) {
        if (t.id) s.user.id = t.id;
        if (t.role) s.user.role = t.role;
      }
      return s;
    },
  },
});

export { handler as GET, handler as POST };