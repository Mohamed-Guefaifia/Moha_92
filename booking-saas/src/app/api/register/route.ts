import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).regex(/^[a-z0-9-]+$/i),
  displayName: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Email ou username déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        username: data.username.toLowerCase(),
        businessProfile: {
          create: { displayName: data.displayName },
        },
        availability: {
          createMany: {
            data: [
              { weekday: 1, startTime: "09:00", endTime: "18:00" },
              { weekday: 2, startTime: "09:00", endTime: "18:00" },
              { weekday: 3, startTime: "09:00", endTime: "18:00" },
              { weekday: 4, startTime: "09:00", endTime: "18:00" },
              { weekday: 5, startTime: "09:00", endTime: "18:00" },
            ],
          },
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, username: user.username });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}