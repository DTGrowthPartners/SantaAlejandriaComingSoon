import { readdir, readFile, copyFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import sharp from 'sharp';
import convert from 'heic-convert';

const SOURCE_DIR = 'src/assets/SantaA/FOTOS SA CARTAGENA';
const OUTPUT_DIR = 'src/assets/cartagena';
const MAX_WIDTH = 1920;
const QUALITY = 82;

function toKebabCase(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function processJpg(filePath, outputName) {
  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toFile(join(OUTPUT_DIR, outputName));
}

async function processHeic(filePath, outputName) {
  const inputBuffer = await readFile(filePath);
  const jpegBuffer = await convert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 1,
  });
  await sharp(Buffer.from(jpegBuffer))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY })
    .toFile(join(OUTPUT_DIR, outputName));
}

async function main() {
  const files = await readdir(SOURCE_DIR);

  let jpgCount = 0;
  let heicCount = 0;
  let errors = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const nameWithoutExt = basename(file, extname(file));
    const kebabName = toKebabCase(nameWithoutExt) + '.jpg';
    const filePath = join(SOURCE_DIR, file);

    try {
      if (ext === '.jpg' || ext === '.jpeg') {
        console.log(`[JPG] ${file} -> ${kebabName}`);
        await processJpg(filePath, kebabName);
        jpgCount++;
      } else if (ext === '.heic') {
        console.log(`[HEIC] ${file} -> ${kebabName}`);
        await processHeic(filePath, kebabName);
        heicCount++;
      }
    } catch (err) {
      console.error(`[ERROR] ${file}: ${err.message}`);
      errors.push(file);
    }
  }

  // Also copy the Habitaciones.jpeg from root SantaA folder
  try {
    const habPath = 'src/assets/SantaA/Habitaciones.jpeg';
    await processJpg(habPath, 'habitaciones-general.jpg');
    console.log(`[JPG] Habitaciones.jpeg -> habitaciones-general.jpg`);
    jpgCount++;
  } catch (err) {
    console.error(`[ERROR] Habitaciones.jpeg: ${err.message}`);
    errors.push('Habitaciones.jpeg');
  }

  console.log(`\nDone! Converted ${jpgCount} JPG + ${heicCount} HEIC = ${jpgCount + heicCount} total`);
  if (errors.length) {
    console.log(`Errors: ${errors.join(', ')}`);
  }
}

main().catch(console.error);
