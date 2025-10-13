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