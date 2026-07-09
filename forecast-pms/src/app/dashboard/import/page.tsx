import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function ImportPage() {
  return (
    <PagePlaceholder
      title="Importar forecast del hotel"
      description="Sube el Excel del forecast (FORECAST ACTUALIZADO 2026.xlsx). El formato ya está analizado: color = canal/estado y comentario = huésped/fechas/monto. El importador se conecta en el siguiente paso."
    />
  );
}
