
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useWhatsapp } from "@/hooks/useWhatsapp";

const WhatsAppFloatingButton = () => {
  const { scrollY } = useScrollProgress();
  const isVisible = scrollY > window.innerHeight * 0.5;
  const { t } = useTranslation();
  const { waUrl } = useWhatsapp("cartagena");

  return (
    <a
      href={waUrl("Hola, me gustaría hacer una reserva en Santa Alejandría Hotel – Cartagena")}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-500 hover:bg-[#20BD5A] hover:scale-110 hover:shadow-xl",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
      aria-label={t("whatsapp", "reservarPorWhatsApp")}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <WhatsAppIcon className="h-6 w-6 relative z-10" />
    </a>
  );
};

export default WhatsAppFloatingButton;
