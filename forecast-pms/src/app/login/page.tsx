import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard/forecast");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Forecast PMS</h1>
          <p className="mt-1 text-sm text-slate-500">Santa Alejandría Hotel</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo: admin@hotel.com · recepcion@hotel.com · contraseña{" "}
          <span className="font-mono">Admin123</span>
        </p>
      </div>
    </main>
  );
}
