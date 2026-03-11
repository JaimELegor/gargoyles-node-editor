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
}, 
{
  name: "DITHER/Ordered/Bayer-Void",
  icon: "🌀",
  params: {
    levels: { value: 2, min: 2, max: 16, step: 1 },
    scale: { value: 4, min: 2, max: 16, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [levels, scale] = params;
    const index = (x, y) => 4 * (x + y * img.width);
    const noise = (Math.sin((x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
    const gray = (r + g + b) / (3 * 255);
    const threshold = (Math.sin((x + y) / scale) * 0.5 + 0.5) * 0.7 + noise * 0.3;
    const out = gray > threshold ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
uniform float scale;
varying vec2 vTexCoord;

float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }

void main(){
  vec2 uv = vTexCoord * resolution;
  vec3 col = texture2D(tex, vTexCoord).rgb;
  float gray = dot(col, vec3(0.299,0.587,0.114));
  float t = (sin((uv.x+uv.y)/scale)*0.5+0.5)*0.7 + rand(uv)*0.3;
  float c = step(t, gray);
  gl_FragColor = vec4(vec3(c),1.0);
}`
},
{
  name: "DITHER/Ordered/Random",
  icon: "🎲",
  params: {
    strength: { value: 1, min: 0, max: 1, step: 0.05 }
  },
  processFunc: (img, r, g, b, a, x, y, strength) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const gray = (r + g + b) / 3 / 255;
    const noise = Math.random() * strength;
    const out = gray + noise > 0.5 ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float strength;
varying vec2 vTexCoord;
float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }

void main(){
  vec3 col = texture2D(tex, vTexCoord).rgb;
  float gray = dot(col, vec3(0.299,0.587,0.114));
  float n = rand(vTexCoord * resolution) * strength;
  float c = step(0.5, gray + n);
  gl_FragColor = vec4(vec3(c),1.0);
}`
},
{
  name: "DITHER/Tone/BitTone",
  icon: "🧱",
  params: {
    levels: { value: 4, min: 2, max: 16, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, levels) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const gray = (r + g + b) / 3;
    const v = Math.floor(gray / (256 / levels)) * (255 / (levels - 1));
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = v;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform float levels;
varying vec2 vTexCoord;

void main(){
  vec3 col = texture2D(tex, vTexCoord).rgb;
  float gray = dot(col, vec3(0.299,0.587,0.114));
  float q = floor(gray * levels) / (levels - 1.0);
  gl_FragColor = vec4(vec3(q),1.0);
}`
},
{
  name: "DITHER/Pattern/Mosaic",
  icon: "🧩",
  params: {
    size: { value: 6, min: 2, max: 20, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, size) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const cellX = Math.floor(x / size) * size;
    const cellY = Math.floor(y / size) * size;
    let sum = 0, count = 0;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const px = cellX + i, py = cellY + j;
        if (px >= img.width || py >= img.height) continue;
        const idx = index(px, py);
        sum += (img.pixels[idx] + img.pixels[idx + 1] + img.pixels[idx + 2]) / 3;
        count++;
      }
    }
    const avg = sum / count;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = avg;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float size;
varying vec2 vTexCoord;
void main(){
  vec2 uv = vTexCoord * resolution;
  vec2 cell = floor(uv / size) * size + size * 0.5;
  vec3 col = texture2D(tex, cell / resolution).rgb;
  gl_FragColor = vec4(col, 1.0);
}`
},
{
  name: "DITHER/Matrix/Bayer-2x2",
  icon: "◽",
  params: {},
  processFunc: (img, r, g, b, a, x, y) => {
    const index = (x, y) => 4 * (x + y * img.width);
    const m = [[0,2],[3,1]];
    const threshold = m[y % 2][x % 2] / 4;
    const gray = (r + g + b) / (3 * 255);
    const out = gray > threshold ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
varying vec2 vTexCoord;
void main(){
  vec2 uv = vTexCoord * resolution;
  int xi = int(mod(uv.x,2.0));
  int yi = int(mod(uv.y,2.0));
  float m[4]; m[0]=0.0;m[1]=2.0;m[2]=3.0;m[3]=1.0;
  float threshold = m[xi+yi*2]/4.0;
  float gray = dot(texture2D(tex,vTexCoord).rgb, vec3(0.299,0.587,0.114));
  float c = step(threshold, gray);
  gl_FragColor = vec4(vec3(c),1.0);
}`
},
{
  name: "DITHER/Matrix/Bayer-4x4",
  icon: "◾",
  params: {},
  processFunc: (img, r, g, b, a, x, y) => {
    const m = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    const index = (x, y) => 4 * (x + y * img.width);
    const threshold = m[y % 4][x % 4] / 16;
    const gray = (r + g + b) / (3 * 255);
    const out = gray > threshold ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
varying vec2 vTexCoord;
void main(){
  vec2 uv = vTexCoord * resolution;
  int xi = int(mod(uv.x,4.0));
  int yi = int(mod(uv.y,4.0));
  float m[16];
  m[0]=0.0;m[1]=8.0;m[2]=2.0;m[3]=10.0;
  m[4]=12.0;m[5]=4.0;m[6]=14.0;m[7]=6.0;
  m[8]=3.0;m[9]=11.0;m[10]=1.0;m[11]=9.0;
  m[12]=15.0;m[13]=7.0;m[14]=13.0;m[15]=5.0;
  float threshold = m[xi+yi*4]/16.0;
  float gray = dot(texture2D(tex,vTexCoord).rgb, vec3(0.299,0.587,0.114));
  float c = step(threshold, gray);
  gl_FragColor = vec4(vec3(c),1.0);
}`
},
{
  name: "DITHER/Matrix/Bayer-8x8",
  icon: "◼️",
  params: {},
  processFunc: (img, r, g, b, a, x, y) => {
    const m = [
      [0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],
      [12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],
      [3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],
      [15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]
    ];
    const index = (x, y) => 4 * (x + y * img.width);
    const threshold = m[y % 8][x % 8] / 64;
    const gray = (r + g + b) / (3 * 255);
    const out = gray > threshold ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
varying vec2 vTexCoord;
void main(){
  vec2 uv = vTexCoord * resolution;
  float gray = dot(texture2D(tex,vTexCoord).rgb, vec3(0.299,0.587,0.114));
  float t = fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453);
  float c = step(t, gray);
  gl_FragColor = vec4(vec3(c),1.0);
}`
},
{
  name: "DITHER/Matrix/Bayer-16x16",
  icon: "⬛",
  params: {},
  processFunc: (img, r, g, b, a, x, y) => {
    const threshold = ((x * 37 + y * 17) % 256) / 255;
    const index = (x, y) => 4 * (x + y * img.width);
    const gray = (r + g + b) / (3 * 255);
    const out = gray > threshold ? 255 : 0;
    img.pixels[index(x, y)] = img.pixels[index(x, y) + 1] = img.pixels[index(x, y) + 2] = out;
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
varying vec2 vTexCoord;
void main(){
  vec2 uv = vTexCoord * resolution;
  float gray = dot(texture2D(tex,vTexCoord).rgb, vec3(0.299,0.587,0.114));
  float t = fract(sin(dot(uv, vec2(12.9898,78.233)))*43758.5453);
  float c = step(t, gray);
  gl_FragColor = vec4(vec3(c), 1.0);
}`
},
{
  name: "DISTORT/Fisheye",
  icon: "🔳",
  params: {
    moveX: { value: 0, min: -1, max: 1, step: 0.01 },
    moveY: { value: 0, min: -1, max: 1, step: 0.01 },
    intensity: { value: 0.5, min: 0.01, max: 2, step: 0.01 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [moveX, moveY, intensity] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    const cx = img.width / 2 + moveX * img.width / 2;
    const cy = img.height / 2 + moveY * img.height / 2;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const factor = 1.0 / (1.0 + intensity * (dist * dist) / ((img.width * img.width + img.height * img.height) / 2));

    const srcX = Math.floor(cx + dx * factor);
    const srcY = Math.floor(cy + dy * factor);

    if (srcX < 0 || srcX >= img.width || srcY < 0 || srcY >= img.height) return;

    const srcI = index(srcX, srcY);
    const dstI = index(x, y);

    img.pixels[dstI]     = img.pixels[srcI];
    img.pixels[dstI + 1] = img.pixels[srcI + 1];
    img.pixels[dstI + 2] = img.pixels[srcI + 2];
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float moveX;
uniform float moveY;
uniform float intensity;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord * resolution;

  vec2 center = vec2(0.5 + moveX * 0.5, 0.5 + moveY * 0.5) * resolution;
  vec2 delta = uv - center;
  float dist2 = dot(delta, delta);

  float factor = 1.0 / (1.0 + intensity * dist2 / dot(resolution, resolution));

  vec2 srcUV = center + delta * factor;
  vec3 color = texture2D(tex, srcUV / resolution).rgb;

  gl_FragColor = vec4(color, 1.0);
}`
}, 
{
  name: "DISTORT/Holdein",
  icon: "🎞️",
  params: {
    moveX: { value: 0, min: -1, max: 1, step: 0.01 },
    moveY: { value: 0, min: -1, max: 1, step: 0.01 },
    intensity: { value: 0.5, min: 0.0, max: 2.0, step: 0.01 },
    direction: { value: 0, min: 0, max: 1, step: 1 } // 0 = vertical, 1 = horizontal
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [moveX, moveY, intensity, direction] = params;
    const index = (x, y) => 4 * (x + y * img.width);

    // Normalized position
    const nx = x / img.width - 0.5;
    const ny = y / img.height - 0.5;

    // Slitscan offset curve
    const offset = Math.sin((direction === 0 ? ny : nx) * Math.PI) * intensity;

    // Shift coordinates
    const srcX = Math.floor(x + moveX * img.width * offset);
    const srcY = Math.floor(y + moveY * img.height * offset);

    if (srcX < 0 || srcX >= img.width || srcY < 0 || srcY >= img.height) return;

    const srcI = index(srcX, srcY);
    const dstI = index(x, y);

    img.pixels[dstI]     = img.pixels[srcI];
    img.pixels[dstI + 1] = img.pixels[srcI + 1];
    img.pixels[dstI + 2] = img.pixels[srcI + 2];
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float moveX;
uniform float moveY;
uniform float intensity;
uniform float direction;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;

  // Normalized center coordinates
  vec2 centered = uv - 0.5;

  // Slitscan offset curve
  float offset = sin((direction == 0.0 ? centered.y : centered.x) * 3.14159) * intensity;

  // Apply directional shift
  vec2 shifted = uv + vec2(moveX * offset, moveY * offset);

  // Sample image with shifted coordinates
  vec3 color = texture2D(tex, shifted).rgb;
  gl_FragColor = vec4(color, 1.0);
}`
}, 
{
  name: "DITHER/Stucki/LinesGlitch",
  icon: "⚡",
  params: {
    levels: { value: 4, min: 2, max: 16, step: 1 },
    glitchAmp: { value: 2.0, min: 0.0, max: 10.0, step: 0.1 },
    lineAmp: { value: 0.4, min: 0.0, max: 1.0, step: 0.05 },
    direction: { value: 0, min: 0, max: 1, step: 1 } // 0 = horizontal, 1 = vertical
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [levels, glitchAmp, lineAmp, direction] = params;
    const index = (x, y) => 4 * (x + y * img.width);
    const w = img.width, h = img.height;

    // Convert to grayscale
    const i = index(x, y);
    const oldPixel = (r + g + b) / 3;
    const quantLevel = Math.round((oldPixel / 255) * (levels - 1));
    const newPixel = (quantLevel / (levels - 1)) * 255;
    const error = oldPixel - newPixel;

    // Apply glitch offset
    const glitchOffset = Math.sin((direction === 0 ? y : x) * 0.05) * glitchAmp;

    // Apply line modulation
    const line = Math.sin((direction === 0 ? y : x) * 0.1) * lineAmp * 255;
    const finalVal = newPixel + line;

    // Write the quantized + glitch-modulated pixel
    img.pixels[i]     = finalVal;
    img.pixels[i + 1] = finalVal;
    img.pixels[i + 2] = finalVal;

    // Stucki diffusion matrix (normalized)
    // (Error distributed to neighbors)
    const diffusion = [
      [2, 8, 4],
      [1, 4, 2]
    ];
    const div = 42; // total weight sum of matrix
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const weight = diffusion[dy]?.[Math.abs(dx) - (dx < 0 ? 0 : 0)] ?? 0;
        if (weight === 0) continue;
        const nx = x + dx;
        const ny = y + dy + 1;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = index(nx, ny);
        const nVal = (img.pixels[ni] + (error * weight) / div);
        img.pixels[ni] = img.pixels[ni + 1] = img.pixels[ni + 2] = nVal;
      }
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
uniform float glitchAmp;
uniform float lineAmp;
uniform float direction;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  vec3 color = texture2D(tex, uv).rgb;
  float gray = dot(color, vec3(0.299, 0.587, 0.114));

  // Quantization
  float quantLevel = floor(gray * (levels - 1.0) + 0.5);
  float q = quantLevel / (levels - 1.0);

  // Line modulation (sinusoidal streaks)
  float coord = direction == 0.0 ? uv.y : uv.x;
  float line = sin(coord * resolution.y * 0.1) * lineAmp;

  // Glitch offset
  float glitch = sin(coord * resolution.y * 0.05) * glitchAmp / resolution.x;
  vec2 glitchUV = uv + vec2(direction == 0.0 ? glitch : 0.0, direction == 1.0 ? glitch : 0.0);

  // Sample again with glitch offset
  vec3 gcolor = texture2D(tex, glitchUV).rgb;
  float ggray = dot(gcolor, vec3(0.299, 0.587, 0.114));
  ggray = floor(ggray * (levels - 1.0) + 0.5) / (levels - 1.0);

  // Mix the two grayscale samples
  float finalGray = mix(q, ggray, 0.5) + line;
  finalGray = clamp(finalGray, 0.0, 1.0);

  gl_FragColor = vec4(vec3(finalGray), 1.0);
}`
},
{
  name: "DITHER/Stucki/Glitch",
  icon: "⚡",
  params: {
    levels: { value: 4, min: 2, max: 16, step: 1 },
    glitchAmp: { value: 2.0, min: 0.0, max: 10.0, step: 0.1 },
    direction: { value: 0, min: 0, max: 1, step: 1 } // 0 = horizontal, 1 = vertical
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [levels, glitchAmp, direction] = params;
    const index = (x, y) => 4 * (x + y * img.width);
    const w = img.width, h = img.height;

    const i = index(x, y);
    const oldPixel = (r + g + b) / 3;
    const quantLevel = Math.round((oldPixel / 255) * (levels - 1));
    const newPixel = (quantLevel / (levels - 1)) * 255;
    const error = oldPixel - newPixel;

    // Glitch offset based on sine distortion
    const glitchOffset = Math.sin((direction === 0 ? y : x) * 0.05) * glitchAmp;
    const srcX = Math.min(Math.max(0, Math.floor(x + (direction === 0 ? glitchOffset : 0))), w - 1);
    const srcY = Math.min(Math.max(0, Math.floor(y + (direction === 1 ? glitchOffset : 0))), h - 1);
    const srcI = index(srcX, srcY);

    const val = img.pixels[srcI];
    img.pixels[i] = img.pixels[i + 1] = img.pixels[i + 2] = val;

    // Stucki diffusion (approximation)
    const diffusion = [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
      [1, 2, 4, 2, 1]
    ];
    const div = 42;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const weight = diffusion[dy][dx + 2];
        if (!weight) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = index(nx, ny);
        const nVal = (img.pixels[ni] + (error * weight) / div);
        img.pixels[ni] = img.pixels[ni + 1] = img.pixels[ni + 2] = nVal;
      }
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
uniform float glitchAmp;
uniform float direction;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  vec3 color = texture2D(tex, uv).rgb;
  float gray = dot(color, vec3(0.299, 0.587, 0.114));

  // Glitch offset along one axis
  float coord = direction == 0.0 ? uv.y : uv.x;
  float glitch = sin(coord * resolution.y * 0.05) * glitchAmp / resolution.x;

  // Apply directional offset
  vec2 glitchUV = uv + vec2(direction == 0.0 ? glitch : 0.0, direction == 1.0 ? glitch : 0.0);

  // Resample the texture
  vec3 gcolor = texture2D(tex, glitchUV).rgb;
  float ggray = dot(gcolor, vec3(0.299, 0.587, 0.114));

  // Quantize grayscale (simulate dithering)
  float quantLevel = floor(ggray * (levels - 1.0) + 0.5);
  float finalGray = quantLevel / (levels - 1.0);

  gl_FragColor = vec4(vec3(finalGray), 1.0);
}`
},
{
  name: "DITHER/ErrorDiffusion/VerticalLines",
  icon: "🟥",
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

    const portion = 1 / 10;
    // Distribute error mostly to the right (vertical lines)
    dither(errR, errG, errB, img.pixels, index(x + 1, y), portion);
    dither(errR, errG, errB, img.pixels, index(x + 2, y), portion);
    dither(errR, errG, errB, img.pixels, index(x + 1, y - 1), portion);
    dither(errR, errG, errB, img.pixels, index(x + 1, y + 1), portion);
    dither(errR, errG, errB, img.pixels, index(x + 2, y + 1), portion);
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
  name: "DITHER/ErrorDiffusion/Shifted",
  icon: "🪄",
  params: {
    shift: { value: 3, min: 1, max: 20, step: 1 },
    errorFactor: { value: 1.0, min: 0.5, max: 2.0, step: 0.1 },
    levels: { value: 1, min: 0.5, max: 3, step: 0.1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [ shift, errorFactor, levels ] = params;
    const index = (x, y) => 4 * (x + y * img.width);
    const quantize = (v) => Math.round(levels * v / 255) * (255 / levels);

    // Quantize current pixel
    const newR = quantize(r);
    const newG = quantize(g);
    const newB = quantize(b);

    img.pixels[index(x, y)]     = newR;
    img.pixels[index(x, y) + 1] = newG;
    img.pixels[index(x, y) + 2] = newB;

    // Compute quantization error
    const errR = (r - newR) * errorFactor;
    const errG = (g - newG) * errorFactor;
    const errB = (b - newB) * errorFactor;

    // Diffuse all error to the right, "shift" pixels away
    const targetX = x + Math.round(shift);
    const targetY = y; // only horizontal shift
    if (targetX < img.width) {
      const i = index(targetX, targetY);
      img.pixels[i]     = Math.min(255, Math.max(0, img.pixels[i]     + errR));
      img.pixels[i + 1] = Math.min(255, Math.max(0, img.pixels[i + 1] + errG));
      img.pixels[i + 2] = Math.min(255, Math.max(0, img.pixels[i + 2] + errB));
    }
  },

  shader: `
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float levels;
uniform float shift;
uniform float errorFactor;
varying vec2 vTexCoord;

float quantize(float v, float l) {
  return floor(v * l) / l;
}

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float l = levels;
  // (Shader version would need multi-pass or texture writes for error diffusion,
  // so this placeholder keeps it simple.)
  vec3 c = vec3(
    quantize(color.r, l),
    quantize(color.g, l),
    quantize(color.b, l)
  );
  gl_FragColor = vec4(c, color.a);
}
`
}, 
{
  name: "COLOR/Point/Threshold",
  icon: "⚫⚪",
  params: {
    threshold: { value: 0.5, min: 0, max: 1, step: 0.01 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    const [threshold] = params;
    const index = (x, y) => 4 * (x + y * img.width);
    const luminance = (r + g + b) / (3 * 255); // normalize to 0–1
    const value = luminance > threshold ? 255 : 0;
    img.pixels[index(x, y)]     = value;
    img.pixels[index(x, y) + 1] = value;
    img.pixels[index(x, y) + 2] = value;
  },

  shader: `
precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float threshold;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(tex, vTexCoord);
  float luminance = (color.r + color.g + color.b) / 3.0;
  float v = luminance > threshold ? 1.0 : 0.0;
  gl_FragColor = vec4(vec3(v), color.a);
}
`
},
{
  name: "EFFECT/Mosaic/ColorMatched",
  icon: "🎴",
  params: {
    numTiles: { value: 100, min: 16, max: 500, step: 16 },
    randomness: { value: 0.5, min: 0, max: 1, step: 0.1 },
    mirrorMode: { value: 1, min: 0, max: 1, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    // On first pixel, process entire image
    if (x === 0 && y === 0) {
      const [numTiles, randomness, mirrorMode] = params;
      const { width, height } = img;
      
      // Helper: Calculate average color of a region
      const getAvgColor = (pixels, x, y, w, h, imgWidth) => {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let py = y; py < y + h && py < height; py++) {
          for (let px = x; px < x + w && px < width; px++) {
            const i = 4 * (px + py * imgWidth);
            sumR += pixels[i];
            sumG += pixels[i + 1];
            sumB += pixels[i + 2];
            count++;
          }
        }
        return [sumR / count, sumG / count, sumB / count];
      };
      
      // Helper: Color distance
      const colorDist = (c1, c2) => {
        return Math.sqrt(
          (c1[0] - c2[0]) ** 2 + 
          (c1[1] - c2[1]) ** 2 + 
          (c1[2] - c2[2]) ** 2
        );
      };
      
      // Step 1: Create 2x2 mirrored mosaic if enabled
      let sourcePixels, sourceWidth, sourceHeight;
      
      if (mirrorMode > 0.5) {
        sourceWidth = width * 2;
        sourceHeight = height * 2;
        sourcePixels = new Uint8ClampedArray(sourceWidth * sourceHeight * 4);
        
        // Copy original and create flips
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcIdx = 4 * (x + y * width);
            const r = img.pixels[srcIdx];
            const g = img.pixels[srcIdx + 1];
            const b = img.pixels[srcIdx + 2];
            const a = img.pixels[srcIdx + 3];
            
            // Top-left: original
            let idx = 4 * (x + y * sourceWidth);
            sourcePixels[idx] = r;
            sourcePixels[idx + 1] = g;
            sourcePixels[idx + 2] = b;
            sourcePixels[idx + 3] = a;
            
            // Top-right: horizontal flip
            idx = 4 * ((width * 2 - x - 1) + y * sourceWidth);
            sourcePixels[idx] = r;
            sourcePixels[idx + 1] = g;
            sourcePixels[idx + 2] = b;
            sourcePixels[idx + 3] = a;
            
            // Bottom-left: vertical flip
            idx = 4 * (x + (height * 2 - y - 1) * sourceWidth);
            sourcePixels[idx] = r;
            sourcePixels[idx + 1] = g;
            sourcePixels[idx + 2] = b;
            sourcePixels[idx + 3] = a;
            
            // Bottom-right: both flips
            idx = 4 * ((width * 2 - x - 1) + (height * 2 - y - 1) * sourceWidth);
            sourcePixels[idx] = r;
            sourcePixels[idx + 1] = g;
            sourcePixels[idx + 2] = b;
            sourcePixels[idx + 3] = a;
          }
        }
      } else {
        sourcePixels = new Uint8ClampedArray(img.pixels);
        sourceWidth = width;
        sourceHeight = height;
      }
      
      // Step 2: Generate random tiles for original image
      const cols = Math.ceil(Math.sqrt(numTiles * (width / height)));
      const rows = Math.ceil(numTiles / cols);
      const baseTileW = width / cols;
      const baseTileH = height / rows;
      
      const originalTiles = [];
      let yPos = 0;
      
      for (let row = 0; row < rows; row++) {
        const variation = randomness * baseTileH;
        const tileH = row < rows - 1 
          ? Math.max(10, Math.min(baseTileH + (Math.random() * 2 - 1) * variation, height - yPos - (rows - row - 1) * 10))
          : height - yPos;
        
        let xPos = 0;
        for (let col = 0; col < cols; col++) {
          const varX = randomness * baseTileW;
          const tileW = col < cols - 1
            ? Math.max(10, Math.min(baseTileW + (Math.random() * 2 - 1) * varX, width - xPos - (cols - col - 1) * 10))
            : width - xPos;
          
          const avgColor = getAvgColor(img.pixels, Math.floor(xPos), Math.floor(yPos), Math.floor(tileW), Math.floor(tileH), width);
          originalTiles.push({ 
            x: Math.floor(xPos), 
            y: Math.floor(yPos), 
            w: Math.floor(tileW), 
            h: Math.floor(tileH), 
            color: avgColor 
          });
          
          xPos += tileW;
        }
        yPos += tileH;
      }
      
      // Step 3: Generate random tiles from source (mosaic)
      const sourceTiles = [];
      yPos = 0;
      
      for (let row = 0; row < rows; row++) {
        const variation = randomness * (sourceHeight / rows);
        const tileH = row < rows - 1
          ? Math.max(10, Math.min(sourceHeight / rows + (Math.random() * 2 - 1) * variation, sourceHeight - yPos - (rows - row - 1) * 10))
          : sourceHeight - yPos;
        
        let xPos = 0;
        for (let col = 0; col < cols; col++) {
          const varX = randomness * (sourceWidth / cols);
          const tileW = col < cols - 1
            ? Math.max(10, Math.min(sourceWidth / cols + (Math.random() * 2 - 1) * varX, sourceWidth - xPos - (cols - col - 1) * 10))
            : sourceWidth - xPos;
          
          const avgColor = getAvgColor(sourcePixels, Math.floor(xPos), Math.floor(yPos), Math.floor(tileW), Math.floor(tileH), sourceWidth);
          sourceTiles.push({ 
            x: Math.floor(xPos), 
            y: Math.floor(yPos), 
            w: Math.floor(tileW), 
            h: Math.floor(tileH), 
            color: avgColor 
          });
          
          xPos += tileW;
        }
        yPos += tileH;
      }
      
      // Step 4: Match and reorganize tiles
      const usedTiles = new Set();
      const newPixels = new Uint8ClampedArray(width * height * 4);
      
      for (const origTile of originalTiles) {
        // Find best matching source tile
        let bestIdx = -1;
        let bestDist = Infinity;
        
        for (let i = 0; i < sourceTiles.length; i++) {
          if (usedTiles.has(i)) continue;
          const dist = colorDist(origTile.color, sourceTiles[i].color);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        
        // If all tiles used, reset
        if (bestIdx === -1) {
          usedTiles.clear();
          bestIdx = 0;
          for (let i = 0; i < sourceTiles.length; i++) {
            const dist = colorDist(origTile.color, sourceTiles[i].color);
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = i;
            }
          }
        }
        
        usedTiles.add(bestIdx);
        const srcTile = sourceTiles[bestIdx];
        
        // Copy and resize source tile to original tile position
        for (let dy = 0; dy < origTile.h; dy++) {
          for (let dx = 0; dx < origTile.w; dx++) {
            if (origTile.x + dx >= width || origTile.y + dy >= height) continue;
            
            const srcX = Math.min(srcTile.x + Math.floor(dx * srcTile.w / origTile.w), sourceWidth - 1);
            const srcY = Math.min(srcTile.y + Math.floor(dy * srcTile.h / origTile.h), sourceHeight - 1);
            const srcIdx = 4 * (srcX + srcY * sourceWidth);
            const dstIdx = 4 * ((origTile.x + dx) + (origTile.y + dy) * width);
            
            newPixels[dstIdx] = sourcePixels[srcIdx];
            newPixels[dstIdx + 1] = sourcePixels[srcIdx + 1];
            newPixels[dstIdx + 2] = sourcePixels[srcIdx + 2];
            newPixels[dstIdx + 3] = sourcePixels[srcIdx + 3];
          }
        }
      }
      
      img.pixels.set(newPixels);
    }
    // No per-pixel processing needed after initial pass
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float numTiles;
uniform float randomness;
uniform float mirrorMode;
varying vec2 vTexCoord;

// Kaleidoscope effect - creates trippy mirrored patterns
void main() {
  vec2 uv = vTexCoord;
  vec2 center = vec2(0.5, 0.5);
  
  // Convert to polar coordinates from center
  vec2 pos = uv - center;
  float angle = atan(pos.y, pos.x);
  float dist = length(pos);
  
  // Create kaleidoscope segments based on numTiles
  float segments = max(3.0, floor(numTiles / 20.0));
  float segmentAngle = 6.28318 / segments;
  
  // Mirror the angle within each segment
  float a = mod(angle, segmentAngle);
  if (mod(floor(angle / segmentAngle), 2.0) > 0.5) {
    a = segmentAngle - a;
  }
  
  // Add some warping based on randomness
  dist = dist * (1.0 + randomness * 0.3 * sin(a * segments * 2.0));
  
  // Convert back to cartesian
  vec2 newUV = center + vec2(cos(a), sin(a)) * dist;
  
  // Add mirroring if enabled
  if (mirrorMode > 0.5) {
    newUV = abs(fract(newUV * 2.0) - 0.5);
  }
  
  // Wrap coordinates
  newUV = fract(newUV);
  
  vec4 color = texture2D(tex, newUV);
  
  // Add some psychedelic color shifting
  color.rgb = mix(color.rgb, color.gbr, randomness * 0.3);
  
  gl_FragColor = color;
}`
},
{
  name: "GLITCH/PixelSort/Datamosh",
  icon: "📊",
  params: {
    mode: { value: 0, min: 0, max: 3, step: 1 }, // 0=brightness, 1=hue, 2=saturation, 3=red
    direction: { value: 0, min: 0, max: 3, step: 1 }, // 0=horizontal, 1=vertical, 2=diagonal, 3=radial
    threshold: { value: 128, min: 0, max: 255, step: 1 },
    reverse: { value: 0, min: 0, max: 1, step: 1 }
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    if (x === 0 && y === 0) {
      const [mode, direction, threshold, reverse] = params;
      const { width, height } = img;
      
      // Helper: Get sort value based on mode
      const getSortValue = (r, g, b) => {
        if (mode === 0) {
          // Brightness
          return 0.299 * r + 0.587 * g + 0.114 * b;
        } else if (mode === 1) {
          // Hue
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max === min) return 0;
          let h;
          if (max === r) h = ((g - b) / (max - min)) % 6;
          else if (max === g) h = (b - r) / (max - min) + 2;
          else h = (r - g) / (max - min) + 4;
          return h * 60;
        } else if (mode === 2) {
          // Saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return max === 0 ? 0 : (max - min) / max * 255;
        } else {
          // Red channel
          return r;
        }
      };
      
      // Helper: Check if pixel should trigger sort
      const shouldSort = (r, g, b) => {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        return brightness > threshold;
      };
      
      const newPixels = new Uint8ClampedArray(img.pixels);
      
      if (direction === 0) {
        // Horizontal sorting
        for (let row = 0; row < height; row++) {
          let sortStart = -1;
          
          for (let col = 0; col <= width; col++) {
            const idx = 4 * (col + row * width);
            const r = img.pixels[idx];
            const g = img.pixels[idx + 1];
            const b = img.pixels[idx + 2];
            
            if (col < width && shouldSort(r, g, b)) {
              if (sortStart === -1) sortStart = col;
            } else {
              if (sortStart !== -1) {
                // Sort this section
                const sortArray = [];
                for (let i = sortStart; i < col; i++) {
                  const idx = 4 * (i + row * width);
                  sortArray.push({
                    r: img.pixels[idx],
                    g: img.pixels[idx + 1],
                    b: img.pixels[idx + 2],
                    a: img.pixels[idx + 3],
                    val: getSortValue(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2])
                  });
                }
                
                sortArray.sort((a, b) => reverse ? b.val - a.val : a.val - b.val);
                
                for (let i = 0; i < sortArray.length; i++) {
                  const idx = 4 * ((sortStart + i) + row * width);
                  newPixels[idx] = sortArray[i].r;
                  newPixels[idx + 1] = sortArray[i].g;
                  newPixels[idx + 2] = sortArray[i].b;
                  newPixels[idx + 3] = sortArray[i].a;
                }
                
                sortStart = -1;
              }
            }
          }
        }
      } else if (direction === 1) {
        // Vertical sorting
        for (let col = 0; col < width; col++) {
          let sortStart = -1;
          
          for (let row = 0; row <= height; row++) {
            const idx = 4 * (col + row * width);
            const r = row < height ? img.pixels[idx] : 0;
            const g = row < height ? img.pixels[idx + 1] : 0;
            const b = row < height ? img.pixels[idx + 2] : 0;
            
            if (row < height && shouldSort(r, g, b)) {
              if (sortStart === -1) sortStart = row;
            } else {
              if (sortStart !== -1) {
                const sortArray = [];
                for (let i = sortStart; i < row; i++) {
                  const idx = 4 * (col + i * width);
                  sortArray.push({
                    r: img.pixels[idx],
                    g: img.pixels[idx + 1],
                    b: img.pixels[idx + 2],
                    a: img.pixels[idx + 3],
                    val: getSortValue(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2])
                  });
                }
                
                sortArray.sort((a, b) => reverse ? b.val - a.val : a.val - b.val);
                
                for (let i = 0; i < sortArray.length; i++) {
                  const idx = 4 * (col + (sortStart + i) * width);
                  newPixels[idx] = sortArray[i].r;
                  newPixels[idx + 1] = sortArray[i].g;
                  newPixels[idx + 2] = sortArray[i].b;
                  newPixels[idx + 3] = sortArray[i].a;
                }
                
                sortStart = -1;
              }
            }
          }
        }
      } else if (direction === 2) {
        // Diagonal sorting (top-left to bottom-right)
        for (let start = 0; start < width + height - 1; start++) {
          const pixels = [];
          let col = start < height ? 0 : start - height + 1;
          let row = start < height ? start : height - 1;
          
          while (col < width && row >= 0) {
            const idx = 4 * (col + row * width);
            pixels.push({
              x: col,
              y: row,
              r: img.pixels[idx],
              g: img.pixels[idx + 1],
              b: img.pixels[idx + 2],
              a: img.pixels[idx + 3],
              val: getSortValue(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2]),
              sort: shouldSort(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2])
            });
            col++;
            row--;
          }
          
          // Find sort regions and sort them
          let sortStart = -1;
          for (let i = 0; i <= pixels.length; i++) {
            if (i < pixels.length && pixels[i].sort) {
              if (sortStart === -1) sortStart = i;
            } else {
              if (sortStart !== -1) {
                const toSort = pixels.slice(sortStart, i);
                toSort.sort((a, b) => reverse ? b.val - a.val : a.val - b.val);
                for (let j = 0; j < toSort.length; j++) {
                  pixels[sortStart + j].r = toSort[j].r;
                  pixels[sortStart + j].g = toSort[j].g;
                  pixels[sortStart + j].b = toSort[j].b;
                  pixels[sortStart + j].a = toSort[j].a;
                }
                sortStart = -1;
              }
            }
          }
          
          // Write back
          for (const p of pixels) {
            const idx = 4 * (p.x + p.y * width);
            newPixels[idx] = p.r;
            newPixels[idx + 1] = p.g;
            newPixels[idx + 2] = p.b;
            newPixels[idx + 3] = p.a;
          }
        }
      } else {
        // Radial sorting from center
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        const numRings = 100;
        
        for (let ring = 0; ring < numRings; ring++) {
          const minDist = (ring / numRings) * maxDist;
          const maxDistRing = ((ring + 1) / numRings) * maxDist;
          const pixels = [];
          
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const dx = x - centerX;
              const dy = y - centerY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist >= minDist && dist < maxDistRing) {
                const idx = 4 * (x + y * width);
                const angle = Math.atan2(dy, dx);
                pixels.push({
                  x, y, angle,
                  r: img.pixels[idx],
                  g: img.pixels[idx + 1],
                  b: img.pixels[idx + 2],
                  a: img.pixels[idx + 3],
                  val: getSortValue(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2]),
                  sort: shouldSort(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2])
                });
              }
            }
          }
          
          // Sort by angle first
          pixels.sort((a, b) => a.angle - b.angle);
          
          // Find sort regions
          let sortStart = -1;
          for (let i = 0; i <= pixels.length; i++) {
            if (i < pixels.length && pixels[i].sort) {
              if (sortStart === -1) sortStart = i;
            } else {
              if (sortStart !== -1) {
                const toSort = pixels.slice(sortStart, i);
                toSort.sort((a, b) => reverse ? b.val - a.val : a.val - b.val);
                for (let j = 0; j < toSort.length; j++) {
                  pixels[sortStart + j].r = toSort[j].r;
                  pixels[sortStart + j].g = toSort[j].g;
                  pixels[sortStart + j].b = toSort[j].b;
                  pixels[sortStart + j].a = toSort[j].a;
                }
                sortStart = -1;
              }
            }
          }
          
          // Write back
          for (const p of pixels) {
            const idx = 4 * (p.x + p.y * width);
            newPixels[idx] = p.r;
            newPixels[idx + 1] = p.g;
            newPixels[idx + 2] = p.b;
            newPixels[idx + 3] = p.a;
          }
        }
      }
      
      img.pixels.set(newPixels);
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float mode;
uniform float direction;
uniform float threshold;
uniform float reverse;
varying vec2 vTexCoord;

// Pseudo-random function
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Datamosh-style displacement effect
void main() {
  vec2 uv = vTexCoord;
  vec4 color = texture2D(tex, uv);
  
  float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  
  // Create glitchy displacement based on threshold
  if (brightness > threshold / 255.0) {
    vec2 displacement = vec2(0.0);
    
    if (direction < 0.5) {
      // Horizontal displacement
      float shift = rand(vec2(uv.y, 0.5)) * 0.1;
      displacement.x = shift * (reverse > 0.5 ? -1.0 : 1.0);
    } else if (direction < 1.5) {
      // Vertical displacement
      float shift = rand(vec2(uv.x, 0.5)) * 0.1;
      displacement.y = shift * (reverse > 0.5 ? -1.0 : 1.0);
    } else if (direction < 2.5) {
      // Diagonal displacement
      float shift = rand(uv) * 0.07;
      displacement = vec2(shift, shift) * (reverse > 0.5 ? -1.0 : 1.0);
    } else {
      // Radial displacement
      vec2 center = vec2(0.5, 0.5);
      vec2 dir = normalize(uv - center);
      float dist = length(uv - center);
      displacement = dir * rand(vec2(dist, 0.5)) * 0.1;
    }
    
    // Sample with displacement
    vec2 newUV = uv + displacement;
    color = texture2D(tex, newUV);
    
    // RGB channel separation for datamosh effect
    if (mode > 0.5) {
      color.r = texture2D(tex, newUV + vec2(0.01, 0.0)).r;
      color.b = texture2D(tex, newUV - vec2(0.01, 0.0)).b;
    }
  }
  
  // Add scanline artifacts
  float scanline = sin(uv.y * resolution.y * 0.5) * 0.05;
  color.rgb += scanline;
  
  gl_FragColor = color;
}`
}, 
{
  name: "EFFECT/Relief/Emboss",
  icon: "⛰️",
  params: {
    angle: { value: 135, min: 0, max: 360, step: 45 }, // Light source angle
    depth: { value: 2, min: 1, max: 10, step: 0.5 }, // Emboss depth/strength
    grayScale: { value: 1, min: 0, max: 1, step: 1 }, // 0 = color, 1 = grayscale
    offset: { value: 128, min: 0, max: 255, step: 1 } // Brightness offset (neutral gray)
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    if (x === 0 && y === 0) {
      const [angle, depth, grayScale, offset] = params;
      const { width, height } = img;
      
      // Convert angle to radians and calculate kernel direction
      const rad = (angle * Math.PI) / 180;
      const dx = Math.round(Math.cos(rad));
      const dy = Math.round(Math.sin(rad));
      
      const newPixels = new Uint8ClampedArray(img.pixels.length);
      const index = (x, y) => 4 * (x + y * width);
      
      // Process each pixel
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = index(px, py);
          
          // Get current pixel values
          const r1 = img.pixels[idx];
          const g1 = img.pixels[idx + 1];
          const b1 = img.pixels[idx + 2];
          
          // Get neighbor pixel in direction of light source
          const nx = px + dx;
          const ny = py + dy;
          
          let r2, g2, b2;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = index(nx, ny);
            r2 = img.pixels[nIdx];
            g2 = img.pixels[nIdx + 1];
            b2 = img.pixels[nIdx + 2];
          } else {
            // Edge handling - use current pixel
            r2 = r1;
            g2 = g1;
            b2 = b1;
          }
          
          // Calculate difference (emboss effect)
          let diffR = (r1 - r2) * depth + offset;
          let diffG = (g1 - g2) * depth + offset;
          let diffB = (b1 - b2) * depth + offset;
          
          // Clamp values
          diffR = Math.max(0, Math.min(255, diffR));
          diffG = Math.max(0, Math.min(255, diffG));
          diffB = Math.max(0, Math.min(255, diffB));
          
          // Apply grayscale if needed
          if (grayScale > 0.5) {
            const gray = (diffR + diffG + diffB) / 3;
            newPixels[idx] = gray;
            newPixels[idx + 1] = gray;
            newPixels[idx + 2] = gray;
          } else {
            newPixels[idx] = diffR;
            newPixels[idx + 1] = diffG;
            newPixels[idx + 2] = diffB;
          }
          newPixels[idx + 3] = img.pixels[idx + 3]; // Keep alpha
        }
      }
      
      img.pixels.set(newPixels);
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float angle;
uniform float depth;
uniform float grayScale;
uniform float offset;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  
  // Convert angle to direction vector
  float rad = radians(angle);
  vec2 dir = vec2(cos(rad), sin(rad));
  
  // Calculate pixel offset based on direction
  vec2 pixelSize = 1.0 / resolution;
  vec2 offset1 = dir * pixelSize;
  
  // Sample current pixel and neighbor in light direction
  vec4 color1 = texture2D(tex, uv);
  vec4 color2 = texture2D(tex, uv + offset1);
  
  // Calculate difference (emboss)
  vec3 diff = (color1.rgb - color2.rgb) * depth + offset / 255.0;
  
  // Clamp to valid range
  diff = clamp(diff, 0.0, 1.0);
  
  // Apply grayscale if needed
  if (grayScale > 0.5) {
    float gray = (diff.r + diff.g + diff.b) / 3.0;
    diff = vec3(gray);
  }
  
  gl_FragColor = vec4(diff, color1.a);
}`
},
{
  name: "GLITCH/CompressionBar/Drag",
  icon: "💽",
  params: {
    barCount: { value: 30, min: 5, max: 100, step: 1 },        // Number of compression bars
    noise: { value: 0.3, min: 0, max: 1, step: 0.05 },         // Level of bar distortion/randomness
    blend: { value: 0.6, min: 0, max: 1, step: 0.05 },         // Blends bars into original
    dragStart: { value: 0.3, min: 0, max: 1, step: 0.05 },     // Where drag effect starts (0-1)
    orientation: { value: 0, min: 0, max: 1, step: 1 }         // 0 = horizontal, 1 = vertical mode
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    if (x === 0 && y === 0) {
      const [barCount, noise, blend, dragStart, orientation] = params;
      const { width, height } = img;
      const src = img.pixels;
      const dst = new Uint8ClampedArray(src);
      const rows = orientation < 0.5 ? height : width;
      const cols = orientation < 0.5 ? width : height;
      const barSize = Math.floor(rows / barCount);
      const dragStartPx = Math.floor(dragStart * rows);

      for (let i = 0; i < barCount; i++) {
        const barStartPx = i * barSize;
        
        // Skip bars that are before dragStart threshold
        if (barStartPx < dragStartPx) continue;
        
        // Choose a reference line or bar for each region, offset by noise
        const barOfs = Math.round((i + (Math.random() - 0.5) * noise * 2) * barSize);
        for (let j = 0; j < cols; j++) {
          let ref;
          if (orientation < 0.5) { // horizontal bars
            const row = Math.min(rows - 1, Math.max(0, barOfs));
            ref = 4 * (j + row * width);
            for (let k = 0; k < barSize; k++) {
              const ypix = i * barSize + k;
              if (ypix >= height) continue;
              const idx = 4 * (j + ypix * width);
              dst[idx]     = blend * src[idx]     + (1 - blend) * src[ref];
              dst[idx + 1] = blend * src[idx + 1] + (1 - blend) * src[ref + 1];
              dst[idx + 2] = blend * src[idx + 2] + (1 - blend) * src[ref + 2];
              dst[idx + 3] = src[idx + 3];
            }
          } else { // vertical bars
            const col = Math.min(cols - 1, Math.max(0, barOfs));
            ref = 4 * (col + j * width);
            for (let k = 0; k < barSize; k++) {
              const xpix = i * barSize + k;
              if (xpix >= width) continue;
              const idx = 4 * (xpix + j * width);
              dst[idx]     = blend * src[idx]     + (1 - blend) * src[ref];
              dst[idx + 1] = blend * src[idx + 1] + (1 - blend) * src[ref + 1];
              dst[idx + 2] = blend * src[idx + 2] + (1 - blend) * src[ref + 2];
              dst[idx + 3] = src[idx + 3];
            }
          }
        }
      }
      img.pixels.set(dst);
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float barCount;
uniform float noise;
uniform float blend;
uniform float dragStart;
uniform float orientation;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  float rows = orientation < 0.5 ? resolution.y : resolution.x;
  float cols = orientation < 0.5 ? resolution.x : resolution.y;
  float barSize = rows / barCount;
  
  float majorCoord = orientation < 0.5 ? uv.y * resolution.y : uv.x * resolution.x;
  float minorCoord = orientation < 0.5 ? uv.x * resolution.x : uv.y * resolution.y;
  
  // Check if we're in the drag zone
  float dragStartPx = dragStart * rows;
  
  if (majorCoord < dragStartPx) {
    // Keep original image
    gl_FragColor = texture2D(tex, uv);
  } else {
    // Apply drag effect
    float barIdx = floor(majorCoord / barSize);
    float noiseOfs = (fract(sin(barIdx * 17.933) * 971.5) - 0.5) * noise * 2.0 * barSize;
    float refMajor = clamp((barIdx + noiseOfs / barSize) * barSize, 0.0, rows-1.0);
    
    vec2 barUV;
    if (orientation < 0.5)
      barUV = vec2(minorCoord / resolution.x, refMajor / resolution.y);
    else
      barUV = vec2(refMajor / resolution.x, minorCoord / resolution.y);
    vec4 barColor = texture2D(tex, barUV);
    vec4 origColor = texture2D(tex, uv);
    gl_FragColor = mix(barColor, origColor, blend);
  }
}`
},
{
  name: "EFFECT/Mirror/Kaleidoscope",
  icon: "🔮",
  params: {
    segments: { value: 6, min: 2, max: 24, step: 1 },          // Number of mirror segments
    angle: { value: 0, min: 0, max: 360, step: 15 },           // Rotation angle of the pattern
    centerX: { value: 0.5, min: 0, max: 1, step: 0.05 },       // Center X position (0-1)
    centerY: { value: 0.5, min: 0, max: 1, step: 0.05 },       // Center Y position (0-1)
    zoom: { value: 1, min: 0.1, max: 3, step: 0.1 }            // Zoom level
  },
  processFunc: (img, r, g, b, a, x, y, ...params) => {
    if (x === 0 && y === 0) {
      const [segments, angle, centerX, centerY, zoom] = params;
      const { width, height } = img;
      const src = new Uint8ClampedArray(img.pixels);
      const dst = new Uint8ClampedArray(img.pixels.length);
      
      const cx = centerX * width;
      const cy = centerY * height;
      const rotRad = (angle * Math.PI) / 180;
      const segmentAngle = (2 * Math.PI) / segments;
      
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          // Convert to coordinates relative to center
          let dx = px - cx;
          let dy = py - cy;
          
          // Apply zoom
          dx /= zoom;
          dy /= zoom;
          
          // Convert to polar coordinates
          let dist = Math.sqrt(dx * dx + dy * dy);
          let ang = Math.atan2(dy, dx) - rotRad;
          
          // Normalize angle to 0-2π
          ang = ((ang % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
          
          // Find which segment we're in
          const segmentIdx = Math.floor(ang / segmentAngle);
          
          // Get angle within segment (0 to segmentAngle)
          let segmentAng = ang - segmentIdx * segmentAngle;
          
          // Mirror every other segment
          if (segmentIdx % 2 === 1) {
            segmentAng = segmentAngle - segmentAng;
          }
          
          // Convert back to cartesian (using only first segment's angle)
          const srcAng = segmentAng + rotRad;
          const srcX = cx + dist * Math.cos(srcAng);
          const srcY = cy + dist * Math.sin(srcAng);
          
          // Sample source pixel with bounds checking
          const dstIdx = 4 * (px + py * width);
          
          if (srcX >= 0 && srcX < width - 1 && srcY >= 0 && srcY < height - 1) {
            // Bilinear interpolation
            const x0 = Math.floor(srcX);
            const x1 = Math.min(x0 + 1, width - 1);
            const y0 = Math.floor(srcY);
            const y1 = Math.min(y0 + 1, height - 1);
            
            const fx = srcX - x0;
            const fy = srcY - y0;
            
            const idx00 = 4 * (x0 + y0 * width);
            const idx10 = 4 * (x1 + y0 * width);
            const idx01 = 4 * (x0 + y1 * width);
            const idx11 = 4 * (x1 + y1 * width);
            
            for (let c = 0; c < 4; c++) {
              const v00 = src[idx00 + c];
              const v10 = src[idx10 + c];
              const v01 = src[idx01 + c];
              const v11 = src[idx11 + c];
              
              const v0 = v00 * (1 - fx) + v10 * fx;
              const v1 = v01 * (1 - fx) + v11 * fx;
              const v = v0 * (1 - fy) + v1 * fy;
              
              dst[dstIdx + c] = Math.round(v);
            }
          } else {
            // Out of bounds - use black or edge color
            dst[dstIdx] = 0;
            dst[dstIdx + 1] = 0;
            dst[dstIdx + 2] = 0;
            dst[dstIdx + 3] = 255;
          }
        }
      }
      
      img.pixels.set(dst);
    }
  },
  shader: `precision mediump float;
uniform sampler2D tex;
uniform vec2 resolution;
uniform float segments;
uniform float angle;
uniform float centerX;
uniform float centerY;
uniform float zoom;
varying vec2 vTexCoord;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

void main() {
  vec2 uv = vTexCoord;
  vec2 center = vec2(centerX, centerY);
  
  // Convert to coordinates relative to center
  vec2 pos = (uv - center) * resolution;
  
  // Apply zoom
  pos /= zoom;
  
  // Convert to polar coordinates
  float dist = length(pos);
  float ang = atan(pos.y, pos.x) - radians(angle);
  
  // Normalize angle to 0-2π
  ang = mod(mod(ang, TWO_PI) + TWO_PI, TWO_PI);
  
  // Calculate segment angle
  float segmentAngle = TWO_PI / segments;
  
  // Find which segment we're in
  float segmentIdx = floor(ang / segmentAngle);
  
  // Get angle within segment
  float segmentAng = ang - segmentIdx * segmentAngle;
  
  // Mirror every other segment
  if (mod(segmentIdx, 2.0) > 0.5) {
    segmentAng = segmentAngle - segmentAng;
  }
  
  // Convert back to cartesian (using only first segment's angle)
  float srcAng = segmentAng + radians(angle);
  vec2 srcPos = vec2(cos(srcAng), sin(srcAng)) * dist;
  
  // Convert back to UV coordinates
  vec2 srcUV = center + srcPos / resolution;
  
  // Sample with wrapping or clamping
  if (srcUV.x >= 0.0 && srcUV.x <= 1.0 && srcUV.y >= 0.0 && srcUV.y <= 1.0) {
    gl_FragColor = texture2D(tex, srcUV);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
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