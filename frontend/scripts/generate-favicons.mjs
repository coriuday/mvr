/**
 * Regenerate favicon assets from public/FAVCON_lOGO.png (letterboxed, no crop).
 * Usage: node scripts/generate-favicons.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const source = path.join(publicDir, "FAVCON_lOGO.png");
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function letterbox(size) {
  const meta = await sharp(source).metadata();
  const scale = Math.min(size / meta.width, size / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);

  const resized = await sharp(source).resize(w, h, { fit: "inside" }).png().toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

const PNG_OUTPUTS = [
  { file: "favicon-96x96.png", size: 96 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "web-app-manifest-192x192.png", size: 192 },
  { file: "web-app-manifest-512x512.png", size: 512 },
];

async function main() {
  for (const { file, size } of PNG_OUTPUTS) {
    const buf = await letterbox(size);
    await fs.writeFile(path.join(publicDir, file), buf);
    console.log(`Wrote ${file} (${size}x${size})`);
  }

  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(icoSizes.map((s) => letterbox(s)));
  await fs.writeFile(path.join(publicDir, "favicon.ico"), await toIco(icoBuffers));
  console.log("Wrote favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
