import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // TODO: remplacer par la session réelle NextAuth
  const user = await prisma.user.findFirst();
  if (!user) return <div className="p-6">Aucun utilisateur</div>;
  const appts = await prisma.appointment.findMany({
    where: { providerId: user.id },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Vos réservations</h1>
      <div className="space-y-3">
        {appts.map((a) => (
          <div key={a.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.clientName}</div>
              <div className="text-sm text-gray-600">{new Date(a.startAt).toLocaleString()} - {a.status}</div>
            </div>
            <form action={`/api/appointments/${a.id}/status`} method="post" className="flex gap-2">
              <input type="hidden" name="action" value="confirm" />
              <button className="px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}