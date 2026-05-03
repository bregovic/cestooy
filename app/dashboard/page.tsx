import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="p-10 card">
      <h1 className="text-3xl font-bold">Ahoj {user?.name}!</h1>
      <p className="text-secondary">Pokud tohle vidíš, tak dashboard funguje a chyba je v komponentách feedu nebo výletů.</p>
    </div>
  );
}
