import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      <NotificationCenter />
    </div>
  );
}
