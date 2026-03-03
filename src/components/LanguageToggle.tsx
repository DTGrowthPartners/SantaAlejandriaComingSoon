import { useTranslation } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "light" | "dark";
}

const LanguageToggle = ({ className, variant = "light" }: LanguageToggleProps) => {
  const { lang, toggleLang } = useTranslation();

  return (
    <button
      onClick={toggleLang}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs font-medium tracking-wide transition-all duration-300 hover:scale-105",
        variant === "light"
          ? "border border-[#FDFCF6]/30 text-[#FDFCF6]/80 hover:bg-[#FDFCF6]/10 hover:text-[#FDFCF6]"
          : "border border-border text-foreground hover:bg-foreground/5",
        className
      )}
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{lang === "es" ? "EN" : "ES"}</span>
    </button>
  );
};

export default LanguageToggle;
