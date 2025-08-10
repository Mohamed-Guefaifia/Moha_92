import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateAppointmentSchema = z.object({
  username: z.string(),
  clientName: z.string().min(2),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional(),
  startAt: z.string(), // ISO
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username requis" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const appts = await prisma.appointment.findMany({ where: { providerId: user.id } });
  return NextResponse.json(appts);
}

export async function POST(req: Request) {
  try {
    const payload: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json();
      if (typeof json === "object" && json !== null) {
        for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
          payload[k] = String(v);
        }
      }
    } else {
      const formData = await req.formData();
      for (const [k, v] of formData.entries()) {
        payload[k] = String(v);
      }
    }

    const data = CreateAppointmentSchema.parse(payload);

    const user = await prisma.user.findUnique({ where: { username: data.username } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const startAt = new Date(data.startAt);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

    const overlap = await prisma.appointment.findFirst({
      where: {
        providerId: user.id,
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    if (overlap) return NextResponse.json({ error: "Créneau indisponible" }, { status: 409 });

    const created = await prisma.appointment.create({
      data: {
        providerId: user.id,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail,
        startAt,
        endAt,
      },
    });

    return NextResponse.json(created);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}