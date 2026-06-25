// Photos for the Medellín hotel, served locally from the repo (no Directus).
// Exteriors feed hero/about/services; rooms and apartaestudios feed their cards.

const exterioresGlob = import.meta.glob(
  "/src/assets/medellin-photos/exteriores/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const habitacionesGlob = import.meta.glob(
  "/src/assets/medellin-photos/habitaciones/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const apartaestudiosGlob = import.meta.glob(
  "/src/assets/medellin-photos/apartaestudios/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const filterByPatterns = (
  source: Record<string, string>,
  patterns: RegExp[]
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const [path, url] of Object.entries(source)) {
    const filename = path.split("/").pop()?.toLowerCase() ?? "";
    if (patterns.some((p) => p.test(filename)) && !seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  }
  return result.sort();
};

export const exteriorImages = {
  fachadas: filterByPatterns(exterioresGlob, [
    /^fachada del hotel.*\.webp$/i,
    /^facha del hotel.*\.webp$/i,
    /^entrada del hotel.*\.webp$/i,
  ]),
  recepcion: filterByPatterns(exterioresGlob, [
    /^recepcion.*\.webp$/i,
    /^recepción.*\.webp$/i,
  ]),
  gimnasio: filterByPatterns(exterioresGlob, [
    /^gim.*\.webp$/i,
    /^gimnasio.*\.webp$/i,
  ]),
  terrazas: filterByPatterns(exterioresGlob, [
    /^terraza.*\.webp$/i,
    /^terrazas.*\.webp$/i,
    /^balcones.*\.webp$/i,
  ]),
  comedor: filterByPatterns(exterioresGlob, [/^comedor.*\.webp$/i]),
};

// Room photos keyed by the category `id` defined in medellin-rooms.ts.
export const roomImages: Record<string, string[]> = {
  "doble-sencilla": filterByPatterns(habitacionesGlob, [
    /^hab s?doble sencilla/i,
  ]),
  twins: filterByPatterns(habitacionesGlob, [/twins/i]),
  triple: filterByPatterns(habitacionesGlob, [/triple/i, /tirple/i]),
  cuadruple: filterByPatterns(habitacionesGlob, [
    /cuadruple/i,
    /cuádrup/i,
    /caudruple/i,
    /^4 sencillas/i,
  ]),
  camarote: filterByPatterns(habitacionesGlob, [/camarote/i]),
  "suite-junior": filterByPatterns(habitacionesGlob, [/suite junior/i]),
};

// Apartaestudio photos keyed by the apartaestudio `id` from medellin-rooms.ts.
export const apartaestudioImages: Record<string, string[]> = {
  "apto-1-ambiente": filterByPatterns(apartaestudiosGlob, [
    /1 ambiente/i,
    /1 ambiete/i,
  ]),
  "apto-2-ambientes": filterByPatterns(apartaestudiosGlob, [
    /2 ambiente/i,
    /dos ambiente/i,
  ]),
  "apto-3-ambientes": filterByPatterns(apartaestudiosGlob, [/3 ambiente/i]),
};
