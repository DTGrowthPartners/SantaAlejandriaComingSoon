import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_META } from "@/lib/domain";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default async function SettingsPage() {
  const user = await requireUser();
  const [hotel, reservationsCount] = await Promise.all([
    prisma.hotel.findUnique({ where: { id: user.hotelId } }),
    prisma.reservation.count({ where: { hotelId: user.hotelId } }),
  ]);

  return (
    <SettingsPanel
      user={{ name: user.name, email: user.email, roleLabel: ROLE_META[user.role].label }}
      hotelName={hotel?.name ?? "—"}
      reservationsCount={reservationsCount}
      isAdmin={user.role === "ADMIN"}
      webPrepayFull={hotel?.webPrepayFull ?? false}
    />
  );
}
