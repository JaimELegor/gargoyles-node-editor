export let savedP5Instance = null;
import { filterManager } from "./FilterManager";


export function sketch(p5) {
  let currentSrc = null;
  let filters = [];
  let paramsMap = {};
  let onCanvasImage;

  savedP5Instance = p5;

  function getScaledSize(imgWidth, imgHeight, minSize = 500, maxSize = 1000) {
    const aspect = imgWidth / imgHeight;
    let w = imgWidth;
    let h = imgHeight;

    if (w > maxSize) {
      w = maxSize;
      h = Math.round(w / aspect);
    }
    if (h > maxSize) {
      h = maxSize;
      w = Math.round(h * aspect);
    }

    if (w < minSize) {
      w = minSize;
      h = Math.round(w / aspect);
    }
    if (h < minSize) {
      h = minSize;
      w = Math.round(h * aspect);
    }

    return [w, h];
  }

  p5.updateWithProps = (props) => {
    if (props.imgSrc && props.imgSrc !== currentSrc) {
      p5.loadImage(props.imgSrc, (loadedImage) => {
        filterManager.setOriginal(loadedImage);
        currentSrc = props.imgSrc;

        // scale canvas
        const [w, h] = getScaledSize(
          loadedImage.width,
          loadedImage.height,
          400,
          900
        );
        p5.resizeCanvas(w, h);

        if (p5.canvas) {
          p5.canvas.width = w;
          p5.canvas.height = h;
          p5.canvas.style.width = `${w}px`;
          p5.canvas.style.height = `${h}px`;
        }

        if (props.onResize) props.onResize({ width: w, height: h });

        // recompute pipeline with current filters
        if (filters.length > 0) {
          filterManager.applyAll(filters, paramsMap);
        }
      });
    }

    if (props.paramsMap) {
      paramsMap = props.paramsMap;
      if (filterManager.original && filters.length > 0) {
        filterManager.applyAll(filters, paramsMap);
      }
    }

    if (props.filter) {
      filters = props.filter;
      if (filterManager.original) {
        filterManager.applyAll(filters, paramsMap);
      }
    }

    if (props.onCanvasImage) {
      onCanvasImage = props.onCanvasImage;
    }
  };

  p5.setup = () => {
    p5.createCanvas(100, 100);
  };

  p5.draw = () => {
    p5.background(57, 255, 20);

    if (!filterManager.mainFiltered) return;

    // draw the precomputed result
    p5.image(
      filterManager.mainFiltered,
      0,
      0,
      p5.width,
      p5.height
    );

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}