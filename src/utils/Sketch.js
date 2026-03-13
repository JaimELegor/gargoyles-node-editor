export let savedP5Instance = null;
import { WorkerBackend } from "./WorkerBackend"; 
import { CPUBackend } from "./CPUBackend";
import { FilterManager } from "./FilterManager";
import { GPUBackend } from "./GPUBackend";

export function sketch(p5) {
  let currentSrc = null;
  let filters = [];
  let paramsMap = {};
  let onCanvasImage;
  let cpuFlag;
  savedP5Instance = p5;
  const gpuBackend = new GPUBackend(p5);
  const cpuBackend = new CPUBackend();
  const workerBackend = new WorkerBackend();
  const filterManager = new FilterManager();

  filterManager.setBackend(workerBackend);

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

  p5.updateWithProps = async (props) => {
    let needsRedraw = false;

    if (props.imgSrc && props.imgSrc !== currentSrc) {
      await new Promise((resolve) => {
        p5.loadImage(props.imgSrc, (loadedImage) => {
          const [w, h] = getScaledSize(loadedImage.width, loadedImage.height, 400, 900);
          
          // Resize image to match canvas size before storing as original
          const resized = p5.createImage(w, h);
          resized.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, w, h);
          resized.loadPixels();

          filterManager.setOriginal(resized);
          currentSrc = props.imgSrc;
          filterManager.mainFiltered = resized.get();

          p5.resizeCanvas(w, h);
          if (p5.canvas) {
            p5.canvas.width = w; p5.canvas.height = h;
            p5.canvas.style.width = `${w}px`; p5.canvas.style.height = `${h}px`;
          }
          if (props.onResize) props.onResize({ width: w, height: h });
          resolve();
        });
      });
      needsRedraw = true;
    }

    if (props.filter) {
      const newNames = props.filter.map(f => f.name).join(",");
      const oldNames = filters.map(f => f.name).join(",");
      filters = [...props.filter];
      if (newNames !== oldNames) needsRedraw = true;
    }

    if (props.paramsMap) {
      const newParams = JSON.stringify(props.paramsMap);
      const oldParams = JSON.stringify(paramsMap);
      if (newParams !== oldParams) {
        paramsMap = props.paramsMap;
        needsRedraw = true;
      }
    }

    if (props.onCanvasImage) { onCanvasImage = props.onCanvasImage; }

    if (props.cpuFlag !== undefined && props.cpuFlag !== cpuFlag) {
      cpuFlag = props.cpuFlag;
      filterManager.setBackend(cpuFlag === false ? gpuBackend : workerBackend);
      needsRedraw = true;
    }

    if (needsRedraw && filterManager.original) {
      await filterManager.applyAll(filters, paramsMap, { force: false }); 
    }
  };

  p5.setup = () => {
    p5.createCanvas(100, 100, p5.WEBGL);
    p5.pixelDensity(1); 
  };

  p5.draw = () => {
    p5.background(0, 0, 0, 0);
    if (!filterManager.mainFiltered) return;
    p5.push();
    p5.imageMode(p5.CENTER);
    p5.image(filterManager.mainFiltered, 0, 0, p5.width, p5.height);
    p5.pop();
    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}