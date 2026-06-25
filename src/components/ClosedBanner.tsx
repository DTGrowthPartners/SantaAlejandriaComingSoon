import { AlertTriangle } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

interface ClosedBannerProps {
  message: string | null;
  reopenDate: string | null;
  whatsappUrl: string;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

const ClosedBanner = ({ message, reopenDate, whatsappUrl }: ClosedBannerProps) => {
  const reopen = formatDate(reopenDate);
  return (
    <div className="sticky top-0 z-50 w-full bg-red-700 text-white shadow-lg">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-sans font-semibold uppercase tracking-wide">
              Hotel temporalmente cerrado
            </p>
            {message && (
              <p className="mt-1 font-sans text-white/90 leading-snug">{message}</p>
            )}
            {reopen && (
              <p className="mt-1 font-sans text-white/90">
                Reapertura estimada: <span className="font-semibold">{reopen}</span>
              </p>
            )}
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-4 py-2 font-sans text-xs font-medium uppercase tracking-wide text-red-700 transition hover:bg-white/90 sm:self-auto"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Avisame cuando reabran
        </a>
      </div>
    </div>
  );
};

export default ClosedBanner;
