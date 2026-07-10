import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard/inicio");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6f2e2] via-cream to-[#ece7d2] p-4">
      {/* Ornamentos suaves de fondo */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/5 ring-1 ring-brand/10">
            <Image src="/favicon.png" alt="Santa Alejandría" width={48} height={48} unoptimized className="h-12 w-12 object-contain" />
          </span>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Santa Alejandría</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gold">Forecast PMS</p>
        </div>

        <LoginForm />
      </div>

      <p className="absolute bottom-5 text-center text-xs text-ink/40">
        Santa Alejandría Hotel · Cartagena
      </p>
    </main>
  );
}
