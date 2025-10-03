import { CPUBackend } from "./CPUBackend";
import { FilterManager } from "./FilterManager";
import { GPUBackend } from "./GPUBackend";

export function monitorSketch(p5) {
  let monitor;
  let img;
  let currentSrc = null;
  let onCanvasImage;
  let filters = [];
  let paramsMap = {};
  let name;
  let cpuFlag;
  const gpuBackend = new GPUBackend(p5);
  const cpuBackend = new CPUBackend();
  const filterManager = new FilterManager();

  p5.updateWithProps = (props) => {
    if (props.imgSrc && props.imgSrc !== currentSrc) {
      p5.loadImage(props.imgSrc, (loadedImage) => {
        filterManager.setOriginal(loadedImage);
        currentSrc = props.imgSrc;
        filterManager.singleFiltered = loadedImage.get();
        if (filters.length > 0) {
          filterManager.applySingle(filters, name, paramsMap);
        }
      });
    }

    if (props.paramsMap) {
      paramsMap = props.paramsMap;
      if (filterManager.original && filters.length > 0) {
        filterManager.applySingle(filters, name, paramsMap);
      }
    }

    if (props.filter) {
      filters = props.filter;
      if (filterManager.original) {
        filterManager.applySingle(filters, name, paramsMap);
      }
    }

    if (props.onCanvasImage) {
      onCanvasImage = props.onCanvasImage;
    }

    if ("name" in props) {
      name = props.name;
      if (filterManager.original && filters.length > 0) {
        filterManager.applySingle(filters, name, paramsMap);
      }
    }

    if (props.cpuFlag !== cpuFlag) {
      cpuFlag = props.cpuFlag;

      if (cpuFlag === false) {
        filterManager.setBackend(gpuBackend);
      } else {
        filterManager.setBackend(cpuBackend);
      }

      if (filterManager.original) {
        filterManager.singleFiltered = filterManager.original.get();
        if (filters.length > 0) {
          filterManager.applySingle(filters, name, paramsMap);
        }
      }
    }
  };

  p5.setup = () => {
    p5.createCanvas(256, 256);
    p5.loadImage("/texture_0.png", (loadedImage) => {
      monitor = loadedImage;
      img = monitor.get();
    });
  };

  p5.draw = () => {
    if (!img) return;

    // draw monitor texture
    p5.image(img, 0, 0, 256, 256);

    // draw filtered preview inside monitor
    if (!filterManager.singleFiltered) return;
    p5.push();
    //p5.imageMode(p5.CENTER);
    p5.image(filterManager.singleFiltered, 52, 60, 62, 50);
    // p5.image(filterManager.mainFiltered, 0, 0, p5.width, p5.height);
    p5.pop();


    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}