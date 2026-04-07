import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-santa-alejandria.png";
import cartagenaImg from "@/assets/centro-historico-cartagena.webp";
import medellinImg from "@/assets/Medellin2.webp";

type CityVariant = "cartagena" | "medellin";

interface CityLoadingScreenProps {
  variant: CityVariant;
  duration?: number;
  onFinish?: () => void;
}

const variantConfig = {
  cartagena: {
    image: cartagenaImg,
    label: "Cartagena de Indias",
    tagline: "Hotel Boutique Colonial",
    // Warm Cartagena palette: deep brown sienna panel
    panelBg: "#4A2410",
    accentColor: "#EFD98A", // cream highlight
    textColor: "#FDFCF6",
    exitDirection: "left", // slides off to the left
  },
  medellin: {
    image: medellinImg,
    label: "Medellín",
    tagline: "Hotel Sector Estadio",
    // Medellín palette: deep olive green panel + cream accent
    panelBg: "#2D5009",
    accentColor: "#EFD98A",
    textColor: "#FAFAF7",
    exitDirection: "right", // slides off to the right
  },
} as const;

const CityLoadingScreen = ({
  variant,
  duration = 2400,
  onFinish,
}: CityLoadingScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");
  const config = variantConfig[variant];

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const enterT = setTimeout(() => setPhase("hold"), 80);
    const exitT = setTimeout(() => setPhase("exit"), duration - 700);
    const doneT = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = original;
      onFinish?.();
    }, duration);

    return () => {
      clearTimeout(enterT);
      clearTimeout(exitT);
      clearTimeout(doneT);
      document.body.style.overflow = original;
    };
  }, [duration, onFinish]);

  if (phase === "done") return null;

  const exitTransform =
    config.exitDirection === "left" ? "translateX(-100%)" : "translateX(100%)";

  // Cartagena: photo on the LEFT, panel on the RIGHT
  // Medellín: panel on the LEFT, photo on the RIGHT
  const photoFirst = variant === "cartagena";

  const panel = (
    <div
      className={cn(
        "relative flex-1 flex items-center justify-center transition-transform duration-[1.4s] ease-out",
        phase === "enter"
          ? photoFirst
            ? "translate-x-full"
            : "-translate-x-full"
          : "translate-x-0"
      )}
      style={{ backgroundColor: config.panelBg }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Top mark */}
        <div
          className={cn(
            "mb-6 transition-all duration-1000 delay-300",
            phase === "enter"
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          )}
        >
          <span
            className="font-sans text-[10px] tracking-[0.4em] uppercase font-medium"
            style={{ color: config.accentColor }}
          >
            Santa Alejandría
          </span>
        </div>

        {/* Logo */}
        <div
          className={cn(
            "mb-6 transition-all duration-[1.4s] ease-out delay-200",
            phase === "enter" ? "opacity-0 scale-90" : "opacity-100 scale-100"
          )}
        >
          <img
            src={logo}
            alt="Santa Alejandría"
            className="h-20 md:h-28 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* City name in serif */}
        <h2
          className={cn(
            "font-serif text-4xl md:text-6xl font-light transition-all duration-1000 delay-500",
            phase === "enter"
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          )}
          style={{ color: config.textColor }}
        >
          {config.label}
        </h2>

        {/* Divider */}
        <div
          className={cn(
            "my-5 h-px transition-all duration-[1.2s] delay-[600ms]",
            phase === "enter" ? "w-0" : "w-20"
          )}
          style={{ backgroundColor: config.accentColor }}
        />

        {/* Tagline */}
        <p
          className={cn(
            "font-sans text-xs tracking-[0.3em] uppercase transition-all duration-1000 delay-700",
            phase === "enter" ? "opacity-0" : "opacity-70"
          )}
          style={{ color: config.accentColor }}
        >
          {config.tagline}
        </p>

        {/* Animated dots */}
        <div
          className={cn(
            "mt-10 flex items-center gap-2 transition-opacity duration-500 delay-1000",
            phase === "enter" ? "opacity-0" : "opacity-100"
          )}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full"
              style={{
                backgroundColor: config.accentColor,
                animation: `cityDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const photo = (
    <div
      className={cn(
        "relative flex-1 transition-transform duration-[1.4s] ease-out",
        phase === "enter"
          ? photoFirst
            ? "-translate-x-full"
            : "translate-x-full"
          : "translate-x-0"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-[3s] ease-out",
          phase === "enter" ? "scale-125" : "scale-100"
        )}
        style={{
          backgroundImage: `url(${config.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Subtle dark gradient overlay */}
      <div
        className={cn(
          "absolute inset-0",
          photoFirst
            ? "bg-gradient-to-r from-black/40 via-transparent to-black/30"
            : "bg-gradient-to-l from-black/30 via-transparent to-black/40"
        )}
      />
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex transition-all duration-700 ease-in-out overflow-hidden",
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        transform: phase === "exit" ? exitTransform : "translateX(0)",
      }}
      aria-hidden="true"
    >
      {photoFirst ? (
        <>
          {photo}
          {panel}
        </>
      ) : (
        <>
          {panel}
          {photo}
        </>
      )}

      <style>{`
        @keyframes cityDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default CityLoadingScreen;
