import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard/forecast");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cream to-brand-light p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <i className="fa-solid fa-hotel text-3xl text-brand" aria-hidden />
          <h1 className="mt-3 font-serif text-2xl font-bold text-brand-dark">
            Santa Alejandría
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
            Forecast PMS
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
