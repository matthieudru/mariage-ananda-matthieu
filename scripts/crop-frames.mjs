import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '../public/frames.jpg');
const OUT = path.join(__dirname, '../public/frames');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Image: 1080×1920px
// Coordinates measured from scaled preview (÷2 = original pixels)
// Each frame cropped tightly with minimal bleed of other frames

const frameCrops = [
  // f1: Gold glitter, horizontal (top-left)
  { id: 'f1', left: 0,   top: 180, width: 318, height: 120 },
  // f2: Brown wood portrait (mid-left)
  { id: 'f2', left: 0,   top: 468, width: 328, height: 380 },
  // f3: Large green mat (center-top) — keep for reference but replaced by illustration
  { id: 'f3', left: 296, top: 100, width: 548, height: 656 },
  // f4: Red velvet box (top-right)
  { id: 'f4', left: 776, top: 56,  width: 304, height: 308 },
  // f5: Birch wood portrait (mid-right)
  { id: 'f5', left: 724, top: 356, width: 356, height: 492 },
  // f6: White mat #1 (middle row, leftmost)
  { id: 'f6', left: 2,   top: 862, width: 262, height: 410 },
  // f7: White mat #2
  { id: 'f7', left: 270, top: 862, width: 264, height: 410 },
  // f8: White mat #3
  { id: 'f8', left: 540, top: 862, width: 264, height: 410 },
  // f9: White mat #4 (rightmost)
  { id: 'f9', left: 808, top: 862, width: 272, height: 410 },
  // f10: Blue fabric landscape (bottom-left)
  { id: 'f10', left: 0,   top: 1274, width: 588, height: 408 },
  // f11: Beige color patches (bottom-right upper)
  { id: 'f11', left: 588, top: 1274, width: 492, height: 222 },
  // f12: Dark portrait frame (bottom-right lower)
  { id: 'f12', left: 588, top: 1496, width: 492, height: 424 },
  // f13: Gold thin landscape (bottom far-left)
  { id: 'f13', left: 0,   top: 1668, width: 292, height: 252 },
  // f14: Brown thin landscape (bottom center-left)
  { id: 'f14', left: 290, top: 1672, width: 302, height: 248 },
];

for (const f of frameCrops) {
  try {
    await sharp(SRC)
      .extract({ left: f.left, top: f.top, width: f.width, height: f.height })
      .toFile(path.join(OUT, `${f.id}.jpg`));
    console.log(`✓ ${f.id} (${f.width}×${f.height})`);
  } catch(e) {
    console.error(`✗ ${f.id}: ${e.message}`);
  }
}

console.log('\nDone!');
