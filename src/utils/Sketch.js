
export let savedP5Instance = null;

export function sketch(p5) {
  let img;
  let original;
  let processed = false;
  let currentSrc = null;
  let filter = null;
  let filterFlag = false;
  let paramsMap;
  let onCanvasImage;
  savedP5Instance = p5;

  function getParamValues(name, paramsMap) {
    if (!paramsMap || !paramsMap[name]) return [];
    return Object.values(paramsMap[name]);
  }

  function getScaledSize(imgWidth, imgHeight, maxSize = 1000) {
    let scale = Math.min(maxSize / imgWidth, maxSize / imgHeight, 1);
    return [imgWidth * scale, imgHeight * scale];
  }

  p5.updateWithProps = (props) => {
  if (props.imgSrc && props.imgSrc !== currentSrc) {
    p5.loadImage(props.imgSrc, (loadedImage) => {
      original = loadedImage;
      img = original.get();
      processed = false;
      currentSrc = props.imgSrc;

      // Scale canvas proportionally if larger than 1000x1000
      const [w, h] = getScaledSize(original.width, original.height);
      p5.resizeCanvas(w, h);

      // Call parent callback with new canvas size
      if (props.onResize) props.onResize({ width: w, height: h });

      filter = props.filter;
      filterFlag = true;
    });
  }

  if (props.paramsMap) {
    paramsMap = props.paramsMap;
    if (original) {
      img = original.get();
      processed = false;
    }
  }

  if (props.filter) {
    filter = props.filter;
    if (original) {
      img = original.get();
      processed = false;
    }
  }

  if (props.onCanvasImage) {
    onCanvasImage = props.onCanvasImage; // store callback
  }
};

  p5.setup = () => {
    // Temporary default canvas size
    p5.createCanvas(100, 100);
  };

  p5.draw = () => {
    p5.background(57, 255, 20);
    if (!img) return;

    const index = (x, y) => {
      const i = 4 * (x + y * img.width);
      const r = img.pixels[i];
      const g = img.pixels[i + 1];
      const b = img.pixels[i + 2];
      const a = img.pixels[i + 3];
      return [r, g, b, a];
    };

    const process = (func, params) => {
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const [r, g, b, a] = index(x, y);
          func(img, r, g, b, a, x, y, ...params);
        }
      }
    };

    if (filterFlag && filter && filter.length > 0 && !processed) {
      img.loadPixels();

      filter.forEach(({ name, func }) => {
        process(func, getParamValues(name, paramsMap));
      });

      img.updatePixels();
      processed = true;
    }

    // Draw the image scaled to canvas size
    p5.image(img, 0, 0, p5.width, p5.height);

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}