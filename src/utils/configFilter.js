export const configFilter = [{
  name: "DITHER/ErrorDiffusion/FloydSteinberg",
  icon: "🖼️",
  params: {
    levels: { value: 1, min: 0.5, max: 3, step: 0.1 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const quantize = (v) => Math.round(value * v / 255) * (255 / value);

    const index = (x, y) => 4 * (x + y * img.width);

    function dither(errR, errG, errB, arr, i, portion) {
      arr[i] = (arr[i] + errR * portion);
      arr[i + 1] = (arr[i + 1] + errG * portion);
      arr[i + 2] = (arr[i + 2] + errB * portion);
    }
    let newR = Math.round(value * r / 255) * (255 / value);
    let newG = Math.round(value * g / 255) * (255 / value);
    let newB = Math.round(value * b / 255) * (255 / value);

    img.pixels[index(x, y)] = newR;
    img.pixels[index(x, y) + 1] = newG;
    img.pixels[index(x, y) + 2] = newB;


    const errR = r - newR;
    const errG = g - newG;
    const errB = b - newB;


    dither(errR, errG, errB, img.pixels, index(x + 1, y), 7 / 16);
    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), 3 / 16);
    dither(errR, errG, errB, img.pixels, index(x, y + 1), 5 / 16);
    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), 1 / 16);

  }
},
{
  name: "COLOR/Point/Grayscale",
  icon: "🎞️",
  params: {
    intensity: { value: 0, min: 0, max: 1, step: 0.1 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const gray = (r + g + b) / 3;

    r = r * (1 - value) + gray * value;
    g = g * (1 - value) + gray * value;
    b = b * (1 - value) + gray * value;

    img.pixels[index(x, y)] = r;
    img.pixels[index(x, y) + 1] = g;
    img.pixels[index(x, y) + 2] = b;
  }
},
{
  name: "COLOR/Tone/Contrast",
  icon: "📈",
  params: {
    amount: { value: 0, min: -0.9, max: 0.9, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const i = 4 * (x + y * img.width);
    // Convert slider (-0.9..0.9) to contrast factor
    // Classic formula: c = (1+v)/(1-v), v ∈ (-1,1)
    const c = (1 + value) / (1 - value);
    const adj = (ch) => {
      const v = c * (ch - 128) + 128;
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    img.pixels[i] = adj(r);
    img.pixels[i + 1] = adj(g);
    img.pixels[i + 2] = adj(b);
  }
},
{
  name: "COLOR/Point/Saturation",
  icon: "🌈",
  params: {
    amount: { value: 0, min: -1, max: 1, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [value] = params;
    const i = 4 * (x + y * img.width);
    // Perceptual luma (Rec. 709) as the gray anchor
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // value = -1..1 -> desaturate to gray or boost away from gray
    const sat = 1 + value; // 0..2
    const adj = (ch) => {
      const v = gray + (ch - gray) * sat;
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    img.pixels[i] = adj(r);
    img.pixels[i + 1] = adj(g);
    img.pixels[i + 2] = adj(b);
  }
},
{
  name: "LIGHT/Point/Brightness",
  icon: "💡",
  params: {
    amount: { value: 0, min: -255, max: 255, step: 5 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const i = 4 * (x + y * img.width);
    const adj = (ch) => {
      const v = ch + value;
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    img.pixels[i] = adj(r);
    img.pixels[i + 1] = adj(g);
    img.pixels[i + 2] = adj(b);
  }
},
{
  name: "DITHER/ErrorDiffusion/Atkinson",
  icon: "🔲",
  params: {
    levels: { value: 1, min: 0.5, max: 3, step: 0.1 },
    spread: { value: 1, min: 0, max: 1, step: 0.05 } // new param
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [levels, spread] = params;

    const quantize = (v) => Math.round(levels * v / 255) * (255 / levels);

    const index = (x, y) => 4 * (x + y * img.width);

    function dither(errR, errG, errB, arr, i, portion) {
      if (i < 0 || i >= arr.length) return; // bounds check
      arr[i]     += errR * portion;
      arr[i + 1] += errG * portion;
      arr[i + 2] += errB * portion;
    }

    // Quantize current pixel
    let newR = quantize(r);
    let newG = quantize(g);
    let newB = quantize(b);

    img.pixels[index(x, y)]     = newR;
    img.pixels[index(x, y) + 1] = newG;
    img.pixels[index(x, y) + 2] = newB;

    // Compute error
    const errR = (r - newR) * spread;
    const errG = (g - newG) * spread;
    const errB = (b - newB) * spread;

    // Atkinson diffusion distributes 1/8 of error to 6 neighbors
    const portion = 1 / 8;
    dither(errR, errG, errB, img.pixels, index(x + 1, y), portion);
    dither(errR, errG, errB, img.pixels, index(x + 2, y), portion);
    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 2), portion);
  }
},
{
  name: "DITHER/Halftone/DotMatrix",
  icon: "⭕",
  params: {
    cellSize: { value: 6, min: 2, max: 20, step: 1 },   // size of each halftone cell
    invert: { value: 0, min: 0, max: 1, step: 1 }       // invert dots/background
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [cellSize, invert] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    // Work out cell origin
    const cellX = Math.floor(x / cellSize) * cellSize;
    const cellY = Math.floor(y / cellSize) * cellSize;

    // Average brightness of this cell (simple grayscale)
    let sum = 0;
    let count = 0;
    for (let cy = 0; cy < cellSize; cy++) {
      for (let cx = 0; cx < cellSize; cx++) {
        const px = cellX + cx;
        const py = cellY + cy;
        if (px >= img.width || py >= img.height) continue;
        const i = index(px, py);
        const rr = img.pixels[i];
        const gg = img.pixels[i + 1];
        const bb = img.pixels[i + 2];
        sum += (rr + gg + bb) / 3;
        count++;
      }
    }
    const avg = sum / count;

    // Map brightness → dot radius
    const radius = (1 - avg / 255) * (cellSize / 2);

    // Check distance of current pixel to center of cell
    const dx = (x - (cellX + cellSize / 2));
    const dy = (y - (cellY + cellSize / 2));
    const dist = Math.sqrt(dx * dx + dy * dy);

    let color = invert ? 255 : 0;
    if (dist < radius) {
      color = invert ? 0 : 255;
    }

    img.pixels[index(x, y)]     = color;
    img.pixels[index(x, y) + 1] = color;
    img.pixels[index(x, y) + 2] = color;
  }
},
{
  name: "COLOR/Tone/Duotone",
  icon: "🎨",
  params: {
    shadowR: { value: 0, min: 0, max: 255, step: 1 },
    shadowG: { value: 0, min: 0, max: 255, step: 1 },
    shadowB: { value: 0, min: 0, max: 255, step: 1 },
    highlightR: { value: 255, min: 0, max: 255, step: 1 },
    highlightG: { value: 255, min: 0, max: 255, step: 1 },
    highlightB: { value: 255, min: 0, max: 255, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [shadowR, shadowG, shadowB, highlightR, highlightG, highlightB] = params;
    const i = 4 * (x + y * img.width);

    // brightness = grayscale value 0..1
    const gray = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Linear interpolation between shadow and highlight
    const mix = (c1, c2, t) => c1 * (1 - t) + c2 * t;

    img.pixels[i]     = mix(shadowR, highlightR, gray);
    img.pixels[i + 1] = mix(shadowG, highlightG, gray);
    img.pixels[i + 2] = mix(shadowB, highlightB, gray);
  }
}
];
