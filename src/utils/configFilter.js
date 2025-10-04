export const configFilter = [
{
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

    let newR = quantize(r);
    let newG = quantize(g);
    let newB = quantize(b);

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
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
varying vec2 vTexCoord;

float quantize(float v, float l) {
  return floor(v * l) / l;
}

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float l = levels;
  vec3 c = vec3(
    quantize(color.r, l),
    quantize(color.g, l),
    quantize(color.b, l)
  );
  gl_FragColor = vec4(c, color.a);
}`
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
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float intensity;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float gray = (color.r + color.g + color.b) / 3.0;
  vec3 c = mix(color.rgb, vec3(gray), intensity);
  gl_FragColor = vec4(c, color.a);
}`
},
{
  name: "COLOR/Tone/Contrast",
  icon: "📈",
  params: {
    amount: { value: 0, min: -0.9, max: 0.9, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const i = 4 * (x + y * img.width);
    const c = (1 + value) / (1 - value);
    const adj = (ch) => {
      const v = c * (ch - 128) + 128;
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    img.pixels[i] = adj(r);
    img.pixels[i + 1] = adj(g);
    img.pixels[i + 2] = adj(b);
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float amount;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float c = (1.0 + amount) / (1.0 - amount);
  vec3 adj = (color.rgb - 0.5) * c + 0.5;
  adj = clamp(adj, 0.0, 1.0);
  gl_FragColor = vec4(adj, color.a);
}`
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
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = 1 + value;
    const adj = (ch) => {
      const v = gray + (ch - gray) * sat;
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    img.pixels[i] = adj(r);
    img.pixels[i + 1] = adj(g);
    img.pixels[i + 2] = adj(b);
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float amount;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float gray = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  float sat = 1.0 + amount;
  vec3 adj = gray + (color.rgb - gray) * sat;
  adj = clamp(adj, 0.0, 1.0);
  gl_FragColor = vec4(adj, color.a);
}`
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
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float amount;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  vec3 adj = clamp(color.rgb + amount / 255.0, 0.0, 1.0);
  gl_FragColor = vec4(adj, color.a);
}`
},
{
  name: "DITHER/ErrorDiffusion/Atkinson",
  icon: "🔲",
  params: {
    levels: { value: 1, min: 0.5, max: 3, step: 0.1 },
    spread: { value: 1, min: 0, max: 1, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [levels, spread] = params;
    const quantize = (v) => Math.round(levels * v / 255) * (255 / levels);
    const index = (x, y) => 4 * (x + y * img.width);

    function dither(errR, errG, errB, arr, i, portion) {
      if (i < 0 || i >= arr.length) return;
      arr[i]     += errR * portion;
      arr[i + 1] += errG * portion;
      arr[i + 2] += errB * portion;
    }

    let newR = quantize(r);
    let newG = quantize(g);
    let newB = quantize(b);

    img.pixels[index(x, y)]     = newR;
    img.pixels[index(x, y) + 1] = newG;
    img.pixels[index(x, y) + 2] = newB;

    const errR = (r - newR) * spread;
    const errG = (g - newG) * spread;
    const errB = (b - newB) * spread;

    const portion = 1 / 8;
    dither(errR, errG, errB, img.pixels, index(x + 1, y), portion);
    dither(errR, errG, errB, img.pixels, index(x + 2, y), portion);
    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x, y + 2), portion);
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
varying vec2 vTexCoord;

float quantize(float v, float l) {
  return floor(v * l) / l;
}

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  vec3 c = vec3(
    quantize(color.r, levels),
    quantize(color.g, levels),
    quantize(color.b, levels)
  );
  gl_FragColor = vec4(c, color.a);
}`
},
{
  name: "DITHER/Halftone/DotMatrix",
  icon: "⭕",
  params: {
    cellSize: { value: 6, min: 2, max: 20, step: 1 },
    invert: { value: 0, min: 0, max: 1, step: 1 },
    blend: { value: 0.5, min: 0, max: 1, step: 0.05 } // 0 = only pattern, 1 = fully original color
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [cellSize, invert, blend] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    const cellX = Math.floor(x / cellSize) * cellSize;
    const cellY = Math.floor(y / cellSize) * cellSize;

    let sum = 0;
    let count = 0;
    for (let cy = 0; cy < cellSize; cy++) {
      for (let cx = 0; cx < cellSize; cx++) {
        const px = cellX + cx;
        const py = cellY + cy;
        if (px >= img.width || py >= img.height) continue;
        const i = index(px, py);
        sum += (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
        count++;
      }
    }

    const avg = sum / count;
    const radius = (1 - avg / 255) * (cellSize / 2);
    const dx = (x - (cellX + cellSize / 2));
    const dy = (y - (cellY + cellSize / 2));
    const dist = Math.sqrt(dx * dx + dy * dy);

    let patternColor = invert ? 255 : 0;
    if (dist < radius) patternColor = invert ? 0 : 255;

    // Blend original color with pattern
    img.pixels[index(x, y)]     = r * blend + patternColor * (1 - blend);
    img.pixels[index(x, y) + 1] = g * blend + patternColor * (1 - blend);
    img.pixels[index(x, y) + 2] = b * blend + patternColor * (1 - blend);
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float cellSize;
uniform float invert;
uniform float blend;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord * resolution;
  vec2 cellUV = floor(uv / cellSize) * cellSize + cellSize * 0.5;
  vec3 color = texture2D(tex, uv / resolution).rgb;
  float gray = (color.r + color.g + color.b) / 3.0;
  float radius = (1.0 - gray) * (cellSize * 0.5);
  float dist = length(uv - cellUV);
  float c = step(dist, radius);
  c = invert > 0.5 ? 1.0 - c : c;

  vec3 finalColor = color * blend + vec3(c) * (1.0 - blend);
  gl_FragColor = vec4(finalColor, 1.0);
}`
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
    const gray = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const mix = (c1, c2, t) => c1 * (1 - t) + c2 * t;
    img.pixels[i]     = mix(shadowR, highlightR, gray);
    img.pixels[i + 1] = mix(shadowG, highlightG, gray);
    img.pixels[i + 2] = mix(shadowB, highlightB, gray);
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform vec3 shadowColor;
uniform vec3 highlightColor;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float gray = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 c = mix(shadowColor, highlightColor, gray);
  gl_FragColor = vec4(c, color.a);
}`
},
{
  name: "BLUR/Gaussian",
  icon: "🌫️",
  params: {
    radius: { value: 2, min: 0, max: 10, step: 0.5 }
  },
  processFunc: (img, r, g, b, a, x, y, value) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const w = img.width;
    const h = img.height;
    const rad = Math.max(1, Math.round(value));
    let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;

    for (let oy = -rad; oy <= rad; oy++) {
      for (let ox = -rad; ox <= rad; ox++) {
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const i = index(nx, ny);
        rSum += img.pixels[i];
        gSum += img.pixels[i + 1];
        bSum += img.pixels[i + 2];
        aSum += img.pixels[i + 3];
        count++;
      }
    }

    img.pixels[index(x, y)]     = rSum / count;
    img.pixels[index(x, y) + 1] = gSum / count;
    img.pixels[index(x, y) + 2] = bSum / count;
    img.pixels[index(x, y) + 3] = aSum / count;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float radius;
varying vec2 vTexCoord;

void main() {
  vec2 texel = 1.0 / resolution;
  vec3 color = vec3(0.0);
  float count = 0.0;

  for (float y = -10.0; y <= 10.0; y++) {
    for (float x = -10.0; x <= 10.0; x++) {
      if (abs(x) > radius || abs(y) > radius) continue;
      color += texture2D(tex, vTexCoord + vec2(x, y) * texel).rgb;
      count += 1.0;
    }
  }

  gl_FragColor = vec4(color / count, texture2D(tex, vTexCoord).a);
}`
},
{
  name: "TEXTURE/Craquelure",
  icon: "🕸️",
  params: {
    intensity: { value: 0.5, min: 0, max: 1, step: 0.05 },
    scale: { value: 10, min: 2, max: 50, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [intensity, scale] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    // Simple procedural craquelure: random cracks based on position
    const noise = ((x * 12.9898 + y * 78.233) % 1) - 0.5; // pseudo-random [-0.5,0.5]
    const edge = (Math.sin(x / scale) * Math.cos(y / scale) + noise) * 2;

    const factor = edge > 0.7 ? 1 - intensity : 1;
    
    img.pixels[index(x, y)]     = r * factor;
    img.pixels[index(x, y) + 1] = g * factor;
    img.pixels[index(x, y) + 2] = b * factor;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float intensity;
uniform float scale;
varying vec2 vTexCoord;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  vec2 uv = vTexCoord * resolution;

  float noise = rand(uv) - 0.5;
  float edge = sin(uv.x / scale) * cos(uv.y / scale) * 2.0 + noise;
  float factor = edge > 0.7 ? 1.0 - intensity : 1.0;

  gl_FragColor = vec4(color.rgb * factor, color.a);
}`
},
{
  name: "COLOR/Point/Invert",
  icon: "🔄",
  params: {
    strength: { value: 1, min: 0, max: 1, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, strength) => {
    const i = 4 * (x + y * img.width);
    const invR = 255 - r;
    const invG = 255 - g;
    const invB = 255 - b;

    // Blend between original and inverted color
    img.pixels[i]     = r * (1 - strength) + invR * strength;
    img.pixels[i + 1] = g * (1 - strength) + invG * strength;
    img.pixels[i + 2] = b * (1 - strength) + invB * strength;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float strength;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  vec3 inverted = 1.0 - color.rgb;
  vec3 blended = mix(color.rgb, inverted, strength);
  gl_FragColor = vec4(blended, color.a);
}`
}
];
//export const configFilter = [{
//  name: "DITHER/ErrorDiffusion/FloydSteinberg",
//  icon: "🖼️",
//  params: {
//    levels: { value: 1, min: 0.5, max: 3, step: 0.1 }
//  },
//  processFunc: (img, r, g, b, a, x, y, value) => {
//    const quantize = (v) => Math.round(value * v / 255) * (255 / value);
//
//    const index = (x, y) => 4 * (x + y * img.width);
//
//    function dither(errR, errG, errB, arr, i, portion) {
//      arr[i] = (arr[i] + errR * portion);
//      arr[i + 1] = (arr[i + 1] + errG * portion);
//      arr[i + 2] = (arr[i + 2] + errB * portion);
//    }
//    let newR = Math.round(value * r / 255) * (255 / value);
//    let newG = Math.round(value * g / 255) * (255 / value);
//    let newB = Math.round(value * b / 255) * (255 / value);
//
//    img.pixels[index(x, y)] = newR;
//    img.pixels[index(x, y) + 1] = newG;
//    img.pixels[index(x, y) + 2] = newB;
//
//
//    const errR = r - newR;
//    const errG = g - newG;
//    const errB = b - newB;
//
//
//    dither(errR, errG, errB, img.pixels, index(x + 1, y), 7 / 16);
//    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), 3 / 16);
//    dither(errR, errG, errB, img.pixels, index(x, y + 1), 5 / 16);
//    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), 1 / 16);
//
//  }
//},
//{
//  name: "COLOR/Point/Grayscale",
//  icon: "🎞️",
//  params: {
//    intensity: { value: 0, min: 0, max: 1, step: 0.1 }
//  },
//  processFunc: (img, r, g, b, a, x, y, value) => {
//    const index = (x, y) => 4 * (x + y * img.width);
//    const gray = (r + g + b) / 3;
//
//    r = r * (1 - value) + gray * value;
//    g = g * (1 - value) + gray * value;
//    b = b * (1 - value) + gray * value;
//
//    img.pixels[index(x, y)] = r;
//    img.pixels[index(x, y) + 1] = g;
//    img.pixels[index(x, y) + 2] = b;
//  }
//},
//{
//  name: "COLOR/Tone/Contrast",
//  icon: "📈",
//  params: {
//    amount: { value: 0, min: -0.9, max: 0.9, step: 0.05 }
//  },
//  processFunc: (img, r, g, b, a, x, y, value) => {
//    const i = 4 * (x + y * img.width);
//    // Convert slider (-0.9..0.9) to contrast factor
//    // Classic formula: c = (1+v)/(1-v), v ∈ (-1,1)
//    const c = (1 + value) / (1 - value);
//    const adj = (ch) => {
//      const v = c * (ch - 128) + 128;
//      return v < 0 ? 0 : v > 255 ? 255 : v;
//    };
//    img.pixels[i] = adj(r);
//    img.pixels[i + 1] = adj(g);
//    img.pixels[i + 2] = adj(b);
//  }
//},
//{
//  name: "COLOR/Point/Saturation",
//  icon: "🌈",
//  params: {
//    amount: { value: 0, min: -1, max: 1, step: 0.05 }
//  },
//  processFunc: (img, r, g, b, a, x, y, ...params) => {
//    const [value] = params;
//    const i = 4 * (x + y * img.width);
//    // Perceptual luma (Rec. 709) as the gray anchor
//    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
//    // value = -1..1 -> desaturate to gray or boost away from gray
//    const sat = 1 + value; // 0..2
//    const adj = (ch) => {
//      const v = gray + (ch - gray) * sat;
//      return v < 0 ? 0 : v > 255 ? 255 : v;
//    };
//    img.pixels[i] = adj(r);
//    img.pixels[i + 1] = adj(g);
//    img.pixels[i + 2] = adj(b);
//  }
//},
//{
//  name: "LIGHT/Point/Brightness",
//  icon: "💡",
//  params: {
//    amount: { value: 0, min: -255, max: 255, step: 5 }
//  },
//  processFunc: (img, r, g, b, a, x, y, value) => {
//    const i = 4 * (x + y * img.width);
//    const adj = (ch) => {
//      const v = ch + value;
//      return v < 0 ? 0 : v > 255 ? 255 : v;
//    };
//    img.pixels[i] = adj(r);
//    img.pixels[i + 1] = adj(g);
//    img.pixels[i + 2] = adj(b);
//  }
//},
//{
//  name: "DITHER/ErrorDiffusion/Atkinson",
//  icon: "🔲",
//  params: {
//    levels: { value: 1, min: 0.5, max: 3, step: 0.1 },
//    spread: { value: 1, min: 0, max: 1, step: 0.05 } // new param
//  },
//  processFunc: (img, r, g, b, a, x, y, ...params) => {
//    const [levels, spread] = params;
//
//    const quantize = (v) => Math.round(levels * v / 255) * (255 / levels);
//
//    const index = (x, y) => 4 * (x + y * img.width);
//
//    function dither(errR, errG, errB, arr, i, portion) {
//      if (i < 0 || i >= arr.length) return; // bounds check
//      arr[i]     += errR * portion;
//      arr[i + 1] += errG * portion;
//      arr[i + 2] += errB * portion;
//    }
//
//    // Quantize current pixel
//    let newR = quantize(r);
//    let newG = quantize(g);
//    let newB = quantize(b);
//
//    img.pixels[index(x, y)]     = newR;
//    img.pixels[index(x, y) + 1] = newG;
//    img.pixels[index(x, y) + 2] = newB;
//
//    // Compute error
//    const errR = (r - newR) * spread;
//    const errG = (g - newG) * spread;
//    const errB = (b - newB) * spread;
//
//    // Atkinson diffusion distributes 1/8 of error to 6 neighbors
//    const portion = 1 / 8;
//    dither(errR, errG, errB, img.pixels, index(x + 1, y), portion);
//    dither(errR, errG, errB, img.pixels, index(x + 2, y), portion);
//    dither(errR, errG, errB, img.pixels, index(x - 1, y + 1), portion);
//    dither(errR, errG, errB, img.pixels, index(x, y + 1), portion);
//    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), portion);
//    dither(errR, errG, errB, img.pixels, index(x, y + 2), portion);
//  }
//},
//{
//  name: "DITHER/Halftone/DotMatrix",
//  icon: "⭕",
//  params: {
//    cellSize: { value: 6, min: 2, max: 20, step: 1 },   // size of each halftone cell
//    invert: { value: 0, min: 0, max: 1, step: 1 }       // invert dots/background
//  },
//  processFunc: (img, r, g, b, a, x, y, ...params) => {
//    const [cellSize, invert] = params;
//    const index = (x, y) => 4 * (x + y * img.width);
//
//    // Work out cell origin
//    const cellX = Math.floor(x / cellSize) * cellSize;
//    const cellY = Math.floor(y / cellSize) * cellSize;
//
//    // Average brightness of this cell (simple grayscale)
//    let sum = 0;
//    let count = 0;
//    for (let cy = 0; cy < cellSize; cy++) {
//      for (let cx = 0; cx < cellSize; cx++) {
//        const px = cellX + cx;
//        const py = cellY + cy;
//        if (px >= img.width || py >= img.height) continue;
//        const i = index(px, py);
//        const rr = img.pixels[i];
//        const gg = img.pixels[i + 1];
//        const bb = img.pixels[i + 2];
//        sum += (rr + gg + bb) / 3;
//        count++;
//      }
//    }
//    const avg = sum / count;
//
//    // Map brightness → dot radius
//    const radius = (1 - avg / 255) * (cellSize / 2);
//
//    // Check distance of current pixel to center of cell
//    const dx = (x - (cellX + cellSize / 2));
//    const dy = (y - (cellY + cellSize / 2));
//    const dist = Math.sqrt(dx * dx + dy * dy);
//
//    let color = invert ? 255 : 0;
//    if (dist < radius) {
//      color = invert ? 0 : 255;
//    }
//
//    img.pixels[index(x, y)]     = color;
//    img.pixels[index(x, y) + 1] = color;
//    img.pixels[index(x, y) + 2] = color;
//  }
//},
//{
//  name: "COLOR/Tone/Duotone",
//  icon: "🎨",
//  params: {
//    shadowR: { value: 0, min: 0, max: 255, step: 1 },
//    shadowG: { value: 0, min: 0, max: 255, step: 1 },
//    shadowB: { value: 0, min: 0, max: 255, step: 1 },
//    highlightR: { value: 255, min: 0, max: 255, step: 1 },
//    highlightG: { value: 255, min: 0, max: 255, step: 1 },
//    highlightB: { value: 255, min: 0, max: 255, step: 1 }
//  },
//  processFunc: (img, r, g, b, a, x, y, ...params) => {
//    const [shadowR, shadowG, shadowB, highlightR, highlightG, highlightB] = params;
//    const i = 4 * (x + y * img.width);
//
//    // brightness = grayscale value 0..1
//    const gray = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
//
//    // Linear interpolation between shadow and highlight
//    const mix = (c1, c2, t) => c1 * (1 - t) + c2 * t;
//
//    img.pixels[i]     = mix(shadowR, highlightR, gray);
//    img.pixels[i + 1] = mix(shadowG, highlightG, gray);
//    img.pixels[i + 2] = mix(shadowB, highlightB, gray);
//  }
//}
//];
//