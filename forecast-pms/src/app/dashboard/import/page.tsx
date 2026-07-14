import { requireUser } from "@/lib/auth";
import { ImportPanel } from "@/components/import/ImportPanel";

export default async function ImportPage() {
  // Cualquier usuario autenticado puede importar el forecast.
  await requireUser();
  return <ImportPanel />;
}
