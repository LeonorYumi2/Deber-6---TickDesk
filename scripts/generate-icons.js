const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Official TickDesk Palette
const PETROL = { r: 36, g: 78, b: 101, a: 255 }; // #244E65
const SKY    = { r: 184, g: 221, b: 227, a: 255 }; // #B8DDE3
const WHITE  = { r: 255, g: 255, b: 255, a: 255 }; // #FFFFFF
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };

function distSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distPill(px, py, x, y, w, h, r) {
  const hx = Math.max(0, (w / 2) - r);
  const hy = Math.max(0, (h / 2) - r);
  const dx = Math.max(0, Math.abs(px - x) - hx);
  const dy = Math.max(0, Math.abs(py - y) - hy);
  return Math.hypot(dx, dy) - r;
}

function distArc(px, py, cx, cy, R, startA, endA) {
  const dx = px - cx;
  const dy = py - cy;
  let angle = Math.atan2(dy, dx);
  while (angle < startA) angle += Math.PI * 2;
  while (angle > startA + Math.PI * 2) angle -= Math.PI * 2;

  if (angle >= startA && angle <= endA) {
    return Math.abs(Math.hypot(dx, dy) - R);
  }
  const p1x = cx + R * Math.cos(startA);
  const p1y = cy + R * Math.sin(startA);
  const p2x = cx + R * Math.cos(endA);
  const p2y = cy + R * Math.sin(endA);
  return Math.min(Math.hypot(px - p1x, py - p1y), Math.hypot(px - p2x, py - p2y));
}

function evaluatePixel(px, py, width, height) {
  const s = width / 1024;
  const CX = width / 2;
  // Shifted so total glyph center is exactly at height / 2 (512)
  const CY = height / 2 + 40 * s;

  // 1. Headband arch
  const archR = 215 * s;
  const archCenterY = CY - 35 * s;
  const dArch = distArc(px, py, CX, archCenterY, archR, Math.PI, 2 * Math.PI);
  const dHeadband = dArch - (22 * s);

  // 2. Earcups
  const cupWidth = 74 * s;
  const cupHeight = 156 * s;
  const cupRadius = 37 * s;
  const leftCupX = CX - archR;
  const rightCupX = CX + archR;
  const cupY = CY + 8 * s;

  const dLeftCup = distPill(px, py, leftCupX, cupY, cupWidth, cupHeight, cupRadius);
  const dRightCup = distPill(px, py, rightCupX, cupY, cupWidth, cupHeight, cupRadius);

  // Inner accents for earcups (pill cushion in SKY)
  const dLeftInner = distPill(px, py, leftCupX, cupY, 32 * s, 110 * s, 16 * s);
  const dRightInner = distPill(px, py, rightCupX, cupY, 32 * s, 110 * s, 16 * s);

  // 3. Microphone boom arm
  const boomR = 115 * s;
  const boomArcCX = leftCupX;
  const boomArcCY = cupY + 165 * s;
  const dBoomArc = distArc(px, py, boomArcCX, boomArcCY, boomR, -Math.PI / 2, 0);

  const dBoomLine = distSegment(px, py, leftCupX + boomR, boomArcCY, CX - 25 * s, boomArcCY);
  const dBoom = Math.min(dBoomArc, dBoomLine) - (11 * s);

  // 4. Microphone capsule
  const micX = CX + 10 * s;
  const micY = boomArcCY;
  const dMic = distPill(px, py, micX, micY, 70 * s, 40 * s, 20 * s);
  const dMicAccent = distPill(px, py, micX + 8 * s, micY, 16 * s, 30 * s, 8 * s);

  const dBaseWhite = Math.min(dHeadband, dLeftCup, dRightCup, dBoom);

  return {
    dBaseWhite,
    dLeftInner,
    dRightInner,
    dMic,
    dMicAccent
  };
}

function renderImage({ width, height, bg, isForegroundOnly, isMonochrome, solidOnly = false }) {
  const png = new PNG({ width, height });

  if (solidOnly) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        png.data[idx] = bg.r;
        png.data[idx + 1] = bg.g;
        png.data[idx + 2] = bg.b;
        png.data[idx + 3] = bg.a;
      }
    }
    return png;
  }

  // 4 sub-samples for anti-aliasing
  const subSamples = [
    [-0.375, -0.375], [0.375, -0.375],
    [-0.375,  0.375], [0.375,  0.375]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

      for (let s = 0; s < subSamples.length; s++) {
        const sx = x + 0.5 + subSamples[s][0];
        const sy = y + 0.5 + subSamples[s][1];

        const { dBaseWhite, dLeftInner, dRightInner, dMic, dMicAccent } = evaluatePixel(sx, sy, width, height);

        let sampleColor;

        if (isMonochrome) {
          const dFull = Math.min(dBaseWhite, dMic);
          if (dFull < 0) {
            sampleColor = WHITE;
          } else if (dFull < 1) {
            const alpha = Math.round(255 * (1 - dFull));
            sampleColor = { r: 255, g: 255, b: 255, a: alpha };
          } else {
            sampleColor = TRANSPARENT;
          }
        } else {
          if (dLeftInner < 0 || dRightInner < 0) {
            sampleColor = SKY;
          } else if (dMicAccent < 0) {
            sampleColor = WHITE;
          } else if (dMic < 0) {
            sampleColor = SKY;
          } else if (dBaseWhite < 0) {
            sampleColor = WHITE;
          } else {
            const dOuter = Math.min(dBaseWhite, dMic);
            if (dOuter < 1) {
              const edgeAlpha = Math.max(0, 1 - dOuter);
              const targetCol = (dMic < dBaseWhite) ? SKY : WHITE;

              if (isForegroundOnly) {
                sampleColor = {
                  r: targetCol.r,
                  g: targetCol.g,
                  b: targetCol.b,
                  a: Math.round(255 * edgeAlpha)
                };
              } else {
                const invA = 1 - edgeAlpha;
                sampleColor = {
                  r: Math.round(targetCol.r * edgeAlpha + bg.r * invA),
                  g: Math.round(targetCol.g * edgeAlpha + bg.g * invA),
                  b: Math.round(targetCol.b * edgeAlpha + bg.g * invA),
                  a: 255
                };
              }
            } else {
              sampleColor = isForegroundOnly ? TRANSPARENT : bg;
            }
          }
        }

        rSum += sampleColor.r * (sampleColor.a / 255);
        gSum += sampleColor.g * (sampleColor.a / 255);
        bSum += sampleColor.b * (sampleColor.a / 255);
        aSum += sampleColor.a;
      }

      const idx = (width * y + x) << 2;
      const finalA = Math.round(aSum / subSamples.length);
      if (finalA > 0) {
        png.data[idx] = Math.round((rSum / subSamples.length) * (255 / finalA));
        png.data[idx + 1] = Math.round((gSum / subSamples.length) * (255 / finalA));
        png.data[idx + 2] = Math.round((bSum / subSamples.length) * (255 / finalA));
        png.data[idx + 3] = finalA;
      } else {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      }
    }
  }

  return png;
}

const imagesDir = path.join(process.cwd(), 'assets', 'images');
console.log('Generating TickDesk icons in:', imagesDir);

// 1. icon.png (1024x1024, Petrol background with White/Sky headset)
console.log('- Generating icon.png (1024x1024)...');
const iconPng = renderImage({
  width: 1024,
  height: 1024,
  bg: PETROL,
  isForegroundOnly: false,
  isMonochrome: false
});
fs.writeFileSync(path.join(imagesDir, 'icon.png'), PNG.sync.write(iconPng));

// 2. android-icon-foreground.png (1024x1024, transparent with White/Sky headset)
console.log('- Generating android-icon-foreground.png (1024x1024)...');
const foregroundPng = renderImage({
  width: 1024,
  height: 1024,
  bg: TRANSPARENT,
  isForegroundOnly: true,
  isMonochrome: false
});
fs.writeFileSync(path.join(imagesDir, 'android-icon-foreground.png'), PNG.sync.write(foregroundPng));

// 3. adaptive-icon.png (1024x1024, transparent with White/Sky headset)
console.log('- Generating adaptive-icon.png (1024x1024)...');
fs.writeFileSync(path.join(imagesDir, 'adaptive-icon.png'), PNG.sync.write(foregroundPng));

// 4. android-icon-background.png (1024x1024, solid Petrol #244E65)
console.log('- Generating android-icon-background.png (1024x1024)...');
const backgroundPng = renderImage({
  width: 1024,
  height: 1024,
  bg: PETROL,
  solidOnly: true
});
fs.writeFileSync(path.join(imagesDir, 'android-icon-background.png'), PNG.sync.write(backgroundPng));

// 5. android-icon-monochrome.png (1024x1024, transparent with pure white silhouette)
console.log('- Generating android-icon-monochrome.png (1024x1024)...');
const monochromePng = renderImage({
  width: 1024,
  height: 1024,
  bg: TRANSPARENT,
  isForegroundOnly: true,
  isMonochrome: true
});
fs.writeFileSync(path.join(imagesDir, 'android-icon-monochrome.png'), PNG.sync.write(monochromePng));

console.log('All TickDesk icons generated successfully!');
