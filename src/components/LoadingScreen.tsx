import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-santa-alejandria.png";
import cartagenaImg from "@/assets/centro-historico-cartagena.webp";
import medellinImg from "@/assets/Medellin2.webp";

interface LoadingScreenProps {
  /** Total time the loader stays visible (ms) */
  duration?: number;
  /** Called once the loader is fully gone */
  onFinish?: () => void;
}

const LoadingScreen = ({ duration = 4000, onFinish }: LoadingScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    // Lock body scroll while loader is active
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const enterT = setTimeout(() => setPhase("hold"), 100);
    const exitT = setTimeout(() => setPhase("exit"), duration - 600);
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

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-primary transition-all duration-700 ease-in-out",
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        // Slide curtain up on exit for a more dramatic reveal
        transform: phase === "exit" ? "translateY(-100%)" : "translateY(0)",
      }}
      aria-hidden="true"
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, white 0%, transparent 50%),
                           radial-gradient(circle at 75% 70%, white 0%, transparent 50%)`,
        }}
      />

      {/* Floating photo circles — Cartagena & Medellín */}
      {/* Cartagena (top-left) */}
      <div
        className={cn(
          "absolute top-[12%] left-[8%] md:top-[15%] md:left-[12%] transition-all duration-[1.6s] ease-out",
          phase === "enter"
            ? "opacity-0 scale-50 -translate-x-8 -translate-y-4"
            : "opacity-100 scale-100 translate-x-0 translate-y-0"
        )}
        style={{
          animation:
            phase !== "enter" ? "float 6s ease-in-out infinite" : undefined,
        }}
      >
        <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-full overflow-hidden border-2 border-highlight/40 shadow-2xl">
          <img
            src={cartagenaImg}
            alt="Cartagena"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-0 flex items-end justify-center pb-5">
            <span className="font-sans text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              Cartagena
            </span>
          </div>
        </div>
        {/* Outer ring */}
        <div className="absolute -inset-3 rounded-full border border-highlight/15 animate-ping" />
      </div>

      {/* Medellín (bottom-right) */}
      <div
        className={cn(
          "absolute bottom-[12%] right-[8%] md:bottom-[15%] md:right-[12%] transition-all duration-[1.8s] ease-out delay-200",
          phase === "enter"
            ? "opacity-0 scale-50 translate-x-8 translate-y-4"
            : "opacity-100 scale-100 translate-x-0 translate-y-0"
        )}
        style={{
          animation:
            phase !== "enter"
              ? "float 7s ease-in-out 0.5s infinite"
              : undefined,
        }}
      >
        <div className="relative h-36 w-36 md:h-52 md:w-52 rounded-full overflow-hidden border-2 border-highlight/40 shadow-2xl">
          <img
            src={medellinImg}
            alt="Medellín"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-0 flex items-end justify-center pb-5">
            <span className="font-sans text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              Medellín
            </span>
          </div>
        </div>
        {/* Outer ring */}
        <div
          className="absolute -inset-3 rounded-full border border-highlight/15 animate-ping"
          style={{ animationDelay: "0.7s" }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Top decorative line */}
        <div
          className={cn(
            "h-px bg-highlight transition-all duration-[1.2s] ease-out",
            phase === "enter" ? "w-0 opacity-0" : "w-32 opacity-100"
          )}
        />

        {/* Logo with subtle scale + fade */}
        <div
          className={cn(
            "my-8 transition-all duration-[1.4s] ease-out",
            phase === "enter"
              ? "opacity-0 scale-90 blur-sm"
              : "opacity-100 scale-100 blur-0"
          )}
        >
          <img
            src={logo}
            alt="Santa Alejandría Hotel"
            className="h-32 md:h-40 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Bottom decorative line */}
        <div
          className={cn(
            "h-px bg-highlight transition-all duration-[1.2s] ease-out delay-100",
            phase === "enter" ? "w-0 opacity-0" : "w-32 opacity-100"
          )}
        />

        {/* Brand tagline */}
        <p
          className={cn(
            "mt-6 font-serif text-sm md:text-base italic tracking-[0.3em] uppercase text-highlight transition-all duration-1000 delay-500",
            phase === "enter" ? "opacity-0 translate-y-2" : "opacity-90 translate-y-0"
          )}
        >
          Santa Alejandría
        </p>

        {/* Animated progress dots */}
        <div
          className={cn(
            "mt-10 flex items-center gap-2 transition-opacity duration-500 delay-700",
            phase === "enter" ? "opacity-0" : "opacity-100"
          )}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-highlight"
              style={{
                animation: `loadingPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes loadingPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
