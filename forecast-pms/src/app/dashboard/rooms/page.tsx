import { requireUser, canManageRooms } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoomsManager, type RoomRow } from "@/components/rooms/RoomsManager";

export default async function RoomsPage() {
  const user = await requireUser();
  const rooms = await prisma.room.findMany({
    where: { hotelId: user.hotelId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { reservations: true } } },
  });

  const rows: RoomRow[] = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    directusSlug: r.directusSlug,
    capacity: r.capacity,
    sortOrder: r.sortOrder,
    active: r.active,
    reservations: r._count.reservations,
  }));

  const canManage = canManageRooms(user.role);

  return <RoomsManager rooms={rows} canManage={canManage} />;
}
