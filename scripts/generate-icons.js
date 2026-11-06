import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Minimal PNG encoder for solid & gradient rectangles with icon emblem
function createPNG(width, height, isMaskable = false) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  const centerX = width / 2;
  const centerY = height / 2;
  const safeRadius = isMaskable ? width * 0.38 : width * 0.46;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark futuristic background #090D16
      let r = 9;
      let g = 13;
      let b = 22;
      let a = 255;

      // Glow circle around center
      if (dist < safeRadius) {
        const glow = 1 - dist / safeRadius;
        r = Math.min(255, Math.floor(r + 10 * glow));
        g = Math.min(255, Math.floor(g + 40 * glow));
        b = Math.min(255, Math.floor(b + 110 * glow));
      }

      // Crossed swords / lightning shield motif in center
      // Draw lightning bolt / diamond crest in electric blue #0066FF / #00E5FF
      const normX = dx / (width * 0.28);
      const normY = dy / (height * 0.28);

      // Diamond / Shield outline
      const diamondDist = Math.abs(normX) + Math.abs(normY);
      if (diamondDist <= 1.05 && diamondDist >= 0.85) {
        // Shield border: electric cyan/blue
        r = 0;
        g = 210;
        b = 255;
      } else if (diamondDist < 0.85) {
        // Inner shield dark blue
        r = 12;
        g = 24;
        b = 50;
      }

      // Lightning bolt in center
      // Pointed polygon approximation
      const inBolt1 = normY >= -0.7 && normY <= 0.05 && normX >= normY * 0.4 - 0.25 && normX <= normY * 0.4 + 0.25;
      const inBolt2 = normY >= -0.05 && normY <= 0.7 && normX >= normY * 0.4 - 0.35 && normX <= normY * 0.4 + 0.15;
      if (inBolt1 || inBolt2) {
        r = 0;
        g = 240;
        b = 255;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG structure
  // Signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter None
    buffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Write files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

// Brand SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0066FF" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#0052FF"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#090D16" rx="96"/>
  <circle cx="256" cy="256" r="220" fill="url(#glow)"/>
  
  <!-- Outer Shield -->
  <polygon points="256,60 410,130 410,290 256,440 102,290 102,130" 
           fill="#0d1527" stroke="url(#shieldGrad)" stroke-width="12" stroke-linejoin="round"/>
  
  <!-- Inner Arena Lines -->
  <polygon points="256,96 378,150 378,272 256,396 134,272 134,150" 
           fill="#070c17" stroke="#00E5FF" stroke-width="4" stroke-opacity="0.5" stroke-linejoin="round"/>
  
  <!-- Lightning Strike -->
  <polygon points="275,130 200,260 255,260 235,380 320,240 265,240" 
           fill="#00E5FF" filter="drop-shadow(0 0 16px rgba(0,229,255,0.8))"/>
  
  <!-- Text BATTLE ARENA -->
  <text x="256" y="475" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="4">BATTLE ARENA</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Icons generated successfully!');
