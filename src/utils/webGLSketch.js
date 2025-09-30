export let savedP5Instance = null;

export function WEBGLSketch(p5) {
  let img;
  let original;
  let currentSrc = null;
  let filters = null;
  let paramsMap = {};
  let onCanvasImage;

  // cache compiled shaders
  let shaders = {};

  // offscreen buffer for shader passes
  let buffer;

  savedP5Instance = p5;

  // simple passthrough vertex shader for 2D filter passes
  const baseVert = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      vTexCoord = aTexCoord;
      gl_Position = vec4(aPosition, 1.0);
    }
  `;

  function getScaledSize(imgWidth, imgHeight, minSize = 500, maxSize = 1000) {
    const aspect = imgWidth / imgHeight;
    let w = imgWidth;
    let h = imgHeight;

    if (w > maxSize) { w = maxSize; h = Math.round(w / aspect); }
    if (h > maxSize) { h = maxSize; w = Math.round(h * aspect); }
    if (w < minSize) { w = minSize; h = Math.round(w / aspect); }
    if (h < minSize) { h = minSize; w = Math.round(h * aspect); }

    return [w, h];
  }

  function getParamValues(name, paramsMap) {
    if (!paramsMap || !paramsMap[name]) return {};
    return paramsMap[name];
  }

  function loadShaders(filterDefs) {
    if (!buffer) return; // ensure buffer is ready
    filterDefs.forEach(({ name, shader }) => {
      if (shader && !shaders[name]) {
        shaders[name] = buffer.createShader(baseVert, shader);
      }
    });
  }

  function runShaderPass(shader, params, inputTex) {
    buffer.shader(shader);

    shader.setUniform("tex", inputTex);
    shader.setUniform("resolution", [p5.width, p5.height]);

    // set uniforms from paramsMap
    Object.entries(params).forEach(([key, val]) => {
      shader.setUniform(key, val);
    });

    // draw fullscreen quad into buffer
    
    
    buffer.beginShape();
    buffer.vertex(-1, -1, 0, 0); // bottom-left
    buffer.vertex(1, -1, 1, 0);  // bottom-right
    buffer.vertex(1, 1, 1, 1);   // top-right
    buffer.vertex(-1, 1, 0, 1);  // top-left
    buffer.endShape();
  }

  p5.updateWithProps = (props) => {
    if (props.imgSrc && props.imgSrc !== currentSrc) {
      p5.loadImage(props.imgSrc, (loadedImage) => {
        original = loadedImage;
        img = original;
        currentSrc = props.imgSrc;

        filters = props.filter;

        const [w, h] = getScaledSize(loadedImage.width, loadedImage.height, 400, 900);
        p5.resizeCanvas(w, h);
        if (p5.canvas) {
          p5.canvas.width = w;
          p5.canvas.height = h;
          p5.canvas.style.width = `${w}px`;
          p5.canvas.style.height = `${h}px`;
        }

        if (props.onResize) props.onResize({ width: w, height: h });

        if (filters) loadShaders(filters);
      });
    }

    if (props.paramsMap) {
      paramsMap = props.paramsMap;
    }

    if (props.filter) {
      filters = props.filter;
      if (filters) loadShaders(filters);
    }

    if (props.onCanvasImage) {
      onCanvasImage = props.onCanvasImage;
    }

  };

  p5.setup = () => {
    p5.createCanvas(600, 400, p5.WEBGL);
    buffer = p5.createGraphics(600, 400, p5.WEBGL); // 🔥 offscreen buffer
    p5.noStroke();
  };

  p5.draw = () => {
    p5.background(57, 255, 20);
    if (!original) return;

    let currentTex = original;

    // apply filters sequentially into buffer
    if (filters && filters.length > 0) {
      filters.forEach(({ name }) => {
      if (!shaders[name]) {
        shaders[name] = buffer.createShader(baseVert, filters[name].shader);
      }
      const params = getParamValues(name, paramsMap);
      runShaderPass(shaders[name], params, currentTex);
      currentTex = buffer;
      });
    }

    // draw final image upright from currentTex
    p5.push();
    p5.imageMode(p5.CENTER);
    //p5.scale(1, -1); // flip vertically
    p5.image(currentTex, 0, 0, p5.width, p5.height);
    p5.pop();

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}
