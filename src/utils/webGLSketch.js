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

  function getParamValues(name, paramsMap) {
    if (!paramsMap || !paramsMap[name]) return {};
    return paramsMap[name];
  }

  function loadShaders(filterDefs) {
    filterDefs.forEach(({ name, shader }) => {
      if (shader && !shaders[name]) {
        // shader is the full GLSL fragment code as string (from JSON)
        shaders[name] = p5.createShader(baseVert, shader);
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
        const params = getParamValues(name, paramsMap);
        runShaderPass(shaders[name], params, currentTex);
        currentTex = buffer; // buffer now holds the latest output
      });
    }

    // draw final image upright from currentTex
    p5.push();
    p5.imageMode(p5.CENTER);
    p5.scale(1, -1); // flip vertically
    p5.image(currentTex, 0, 0, p5.width, p5.height);
    p5.pop();

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}
