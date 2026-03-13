import { FilterManager } from "./FilterManager";
import { GPUBackend } from "./GPUBackend";
import { WorkerBackend } from "./WorkerBackend";

export function invisibleSketch(p5) {
  let currentSrc = null;
  let onCanvasImage;
  let filters = [];
  let paramsMap = {};
  let name;
  let cpuFlag;
  const gpuBackend = new GPUBackend(p5);
  const workerBackend = new WorkerBackend();
  const filterManager = new FilterManager();

  filterManager.setBackend(workerBackend);

  let debounceTimer = null;
  function scheduleApply() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!filterManager.original || !filters || !name) return;
      await filterManager.applySingle(filters, name, paramsMap, { force: false });
    }, 40);
  }

  p5.updateWithProps = async (props) => {
    let needsRedraw = false;

    if (props.imgSrc && props.imgSrc !== currentSrc) {
      await new Promise((resolve) => {
        p5.loadImage(props.imgSrc, (loadedImage) => {
         
          const resized = p5.createImage(225, 225);
          resized.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, 225, 225);
          resized.loadPixels();

          filterManager.setOriginal(resized);
          currentSrc = props.imgSrc;
          filterManager.singleFiltered = resized.get();
          resolve();
        });
      });
      needsRedraw = true;
    }

    if (props.paramsMap) { paramsMap = props.paramsMap; needsRedraw = true; }
    if (props.filter)    { filters = props.filter;      needsRedraw = true; }
    if (props.onCanvasImage) { onCanvasImage = props.onCanvasImage; }

    if ("name" in props) { name = props.name; needsRedraw = true; }

    if (props.cpuFlag !== undefined && props.cpuFlag !== cpuFlag) {
      cpuFlag = props.cpuFlag;
      filterManager.setBackend(cpuFlag === false ? gpuBackend : workerBackend);
      filterManager.singleFiltered = filterManager.original?.get() ?? null;
      needsRedraw = true;
    }

    if (needsRedraw && filterManager.original && filters && name) {
      scheduleApply();
    }
  };

  p5.setup = () => {
    p5.createCanvas(225, 225);
    p5.pixelDensity(1); 
  };

  p5.draw = () => {
    if (!filterManager.singleFiltered) return;
    p5.push();
    p5.image(filterManager.singleFiltered, 0, 0, p5.width, p5.height);
    p5.pop();
    if (onCanvasImage && p5.canvas) onCanvasImage(p5.canvas);
  };
}