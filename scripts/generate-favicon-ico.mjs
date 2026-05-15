import sharp from "sharp";
import pngToIco from "png-to-ico";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/favicon.svg");
const icoPath = resolve(root, "public/favicon.ico");

function oklchToHex(L, C, h) {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b2 = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const lin2srgb = (x) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const toHex = (v) =>
    Math.round(clamp(lin2srgb(v)) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b2)}`;
}

const svgRaw = readFileSync(svgPath, "utf8");
const svgHex = svgRaw.replace(
  /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)/g,
  (_, L, C, h) => oklchToHex(parseFloat(L), parseFloat(C), parseFloat(h)),
);

const sizes = [16, 32, 48];
const buffers = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(svgHex), { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9, palette: true, quality: 100 })
      .toBuffer(),
  ),
);

const ico = await pngToIco(buffers);
writeFileSync(icoPath, ico);
console.log(`Wrote ${icoPath} (${sizes.join(", ")}px)`);
