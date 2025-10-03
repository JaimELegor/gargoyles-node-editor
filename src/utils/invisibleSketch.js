import { FilterManager } from "./FilterManager";
import { CPUBackend } from "./CPUBackend";
import { GPUBackend } from "./GPUBackend";

export function invisibleSketch(p5) {
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
    p5.createCanvas(225, 225);
  };

  p5.draw = () => {
    if (!filterManager.singleFiltered) return;

    p5.push();
    //p5.imageMode(p5.CENTER);
    p5.image(filterManager.singleFiltered, 0, 0, p5.width, p5.height);
    p5.pop();

    if (onCanvasImage && p5.canvas) {
        onCanvasImage(p5.canvas);
    }
    

  };
}