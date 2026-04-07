// Auto-import all Medellín hotel photos from assets folder.
// Vite resolves these at build time and returns hashed URLs.

const habitacionesGlob = import.meta.glob(
  "/src/assets/medellin-photos/habitaciones/*.jpeg",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const apartaestudiosGlob = import.meta.glob(
  "/src/assets/medellin-photos/apartaestudios/*.jpeg",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const exterioresGlob = import.meta.glob(
  "/src/assets/medellin-photos/exteriores/*.jpeg",
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
    /^hab doble sencilla.*aa.*\.jpeg$/i,
    /^hab sdoble sencilla.*\.jpeg$/i,
  ]),
  twins: filterByPatterns(habitacionesGlob, [/^hab twins.*\.jpeg$/i]),
  triple: filterByPatterns(habitacionesGlob, [
    /^hab triple camas sencillas.*\.jpeg$/i,
    /^hab triple cama sencilla.*\.jpeg$/i,
    /^hab triple 1 cama sencilla 1 doble.*\.jpeg$/i,
    /^triple 1 doble 1 sencilla abanico.*\.jpeg$/i,
    /^hab tirple camas sencillas.*\.jpeg$/i,
  ]),
  cuadruple: filterByPatterns(habitacionesGlob, [
    /^4 sencillas abanico.*\.jpeg$/i,
    /^hab cuádrup.*camas sencillas.*\.jpeg$/i,
    /^hab cuádruple 1 doble 2 sencillas.*\.jpeg$/i,
    /^cuadruple aa 1 doble 2 sencillas.*\.jpeg$/i,
    /^caudruple 1 doble 2 sencillas abanico.*\.jpeg$/i,
    /^cuadruple 2 sencillas 1 doble abanicp.*\.jpeg$/i,
  ]),
  camarote: filterByPatterns(habitacionesGlob, [
    /^camarote 6 personas.*\.jpeg$/i,
  ]),
  "suite-junior": filterByPatterns(habitacionesGlob, [
    /^suite junior.*\.jpeg$/i,
  ]),
};

// Apartaestudios → images by ambiente count
export const apartaestudioImages: Record<string, string[]> = {
  "apto-1-ambiente": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio.? ?1 ambiente.*\.jpeg$/i,
    /^apartaestudios 1 ambie.e.*\.jpeg$/i,
  ]),
  "apto-2-ambientes": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio.? ?2 ambientes.*\.jpeg$/i,
    /^apartaestudios dos ambientes.*\.jpeg$/i,
  ]),
  "apto-3-ambientes": filterByPatterns(apartaestudiosGlob, [
    /^apartaestudio 3 ambientes.*\.jpeg$/i,
  ]),
};

// Exteriors / common areas — for hero, about, services sections
export const exteriorImages = {
  fachadas: filterByPatterns(exterioresGlob, [
    /^fachada del hotel.*\.jpeg$/i,
    /^facha del hotel.*\.jpeg$/i,
    /^entrada del hotel.*\.jpeg$/i,
  ]),
  recepcion: filterByPatterns(exterioresGlob, [
    /^recepcion.*\.jpeg$/i,
    /^recepción.*\.jpeg$/i,
  ]),
  gimnasio: filterByPatterns(exterioresGlob, [
    /^gim.*\.jpeg$/i,
    /^gimnasio.*\.jpeg$/i,
  ]),
  terrazas: filterByPatterns(exterioresGlob, [
    /^terraza.*\.jpeg$/i,
    /^terrazas.*\.jpeg$/i,
    /^balcones.*\.jpeg$/i,
  ]),
  comedor: filterByPatterns(exterioresGlob, [/^comedor.*\.jpeg$/i]),
};
