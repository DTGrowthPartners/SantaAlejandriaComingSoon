import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ImportPanel } from "@/components/import/ImportPanel";

export default async function ImportPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/dashboard/forecast");
  }
  return <ImportPanel />;
}
