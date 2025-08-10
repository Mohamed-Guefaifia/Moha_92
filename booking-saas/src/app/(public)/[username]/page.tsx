import { prisma } from "@/lib/prisma";
import { addHours, startOfHour, setMinutes, setSeconds, isBefore } from "date-fns";

async function getData(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      businessProfile: true,
      availability: true,
      appointments: true,
    },
  });
  return user;
}

function generateSlots(date: Date) {
  const start = startOfHour(setSeconds(setMinutes(date, 0), 0));
  const slots: Date[] = [];
  for (let i = 0; i < 10; i++) {
    slots.push(addHours(start, i));
  }
  return slots;
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getData(username);
  if (!user) return <div className="p-6">Utilisateur introuvable</div>;

  const today = new Date();
  const slots = generateSlots(today);
  const booked = new Set(user.appointments.map((a) => new Date(a.startAt).toISOString()));

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{user.businessProfile?.displayName}</h1>
        <p className="text-gray-600">Réservez un créneau d&apos;une heure</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => {
          const disabled = booked.has(slot.toISOString()) || isBefore(slot, new Date());
          return (
            <form key={slot.toISOString()} action="/api/appointments" method="post" className="border rounded p-3 flex flex-col gap-2">
              <input type="hidden" name="username" value={user.username} />
              <input type="hidden" name="startAt" value={slot.toISOString()} />
              <div className="text-sm">{slot.toLocaleString()}</div>
              <input required name="clientName" placeholder="Votre nom" className="border rounded px-2 py-1" />
              <input name="clientPhone" placeholder="Téléphone" className="border rounded px-2 py-1" />
              <input name="clientEmail" placeholder="Email" className="border rounded px-2 py-1" />
              <button disabled={disabled} className="bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50">Réserver</button>
            </form>
          );
        })}
      </div>
      <div>
        <p className="text-sm text-gray-500">Message à copier après appel manqué:</p>
        <code className="block bg-gray-100 p-2 rounded break-all">Bonjour, nous avons manqué votre appel. Réservez ici : {`${process.env.NEXTAUTH_URL}/${user.username}`}</code>
      </div>
    </div>
  );
}