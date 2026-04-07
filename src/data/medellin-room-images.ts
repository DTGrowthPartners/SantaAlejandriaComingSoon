// Auto-import all Medellín hotel photos from assets folder.
// Vite resolves these at build time and returns hashed URLs.

const habitacionesGlob = import.meta.glob(
  "/src/assets/medellin-photos/habitaciones/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const apartaestudiosGlob = import.meta.glob(
  "/src/assets/medellin-photos/apartaestudios/*.webp",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const exterioresGlob = import.meta.glob(
  "/src/assets/medellin-photos/exteriores/*.webp",
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

// Room category → image filename patterns
export const medellinRoomImages: Record<string, string[]> = {
  "doble-sencilla": filterByPatterns(habitacionesGlob, [
    /^hab doble sencilla.*aa.*\.webp$/i,
    /^hab sdoble sencilla.*\.webp$/i,
  ]),
  twins: filterByPatterns(habitacionesGlob, [/^hab twins.*\.webp$/i]),
  triple: filterByPatterns(habitacionesGlob, [
    /^hab triple camas sencillas.*\.webp$/i,
    /^hab triple cama sencilla.*\.webp$/i,
    /^hab triple 1 cama sencilla 1 doble.*\.webp$/i,
    /^triple 1 doble 1 sencilla abanico.*\.webp$/i,
    /^hab tirple camas sencillas.*\.webp$/i,
  ]),
  cuadruple: filterByPatterns(habitacionesGlob, [
    /^4 sencillas abanico.*\.webp$/i,
    /^hab cuádrup.*camas sencillas.*\.webp$/i,
    /^hab cuádruple 1 doble 2 sencillas.*\.webp$/i,
    /^cuadruple aa 1 doble 2 sencillas.*\.webp$/i,
    /^caudruple 1 doble 2 sencillas abanico.*\.webp$/i,
    /^cuadruple 2 sencillas 1 doble abanicp.*\.webp$/i,
  ]),
  camarote: filterByPatterns(habitacionesGlob, [
    /^camarote 6 personas.*\.webp$/i,
  ]),
  "suite-junior": filterByPatterns(habitacionesGlob, [
    /^suite junior.*\.webp$/i,
  ]),
};

// Apartaestudios → images by ambiente count
export const apartaestudioImages: Record<string, string[]> = {
  "apto-1-ambiente": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio.? ?1 ambiente.*\.webp$/i,
    /^apartaestudios 1 ambie.e.*\.webp$/i,
  ]),
  "apto-2-ambientes": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio.? ?2 ambientes.*\.webp$/i,
    /^apartaestudios dos ambientes.*\.webp$/i,
  ]),
  "apto-3-ambientes": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio 3 ambientes.*\.webp$/i,
  ]),
};

// Exteriors / common areas — for hero, about, services sections
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
