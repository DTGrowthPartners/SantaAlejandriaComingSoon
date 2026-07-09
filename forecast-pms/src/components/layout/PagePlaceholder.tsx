export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        <p className="mt-6 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Módulo en construcción
        </p>
      </div>
    </div>
  );
}
