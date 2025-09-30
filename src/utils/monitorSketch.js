import { filterManager } from "./FilterManager";

export function monitorSketch(p5) {
  let monitor;
  let img;
  let currentSrc = null;
  let onCanvasImage;
  let filters = [];
  let paramsMap = {};
  let name;

  function getParamValues(name, paramsMap) {
    if (!paramsMap || !paramsMap[name]) return [];
    return Object.values(paramsMap[name]);
  }

  p5.updateWithProps = (props) => {
    if (props.imgSrc && props.imgSrc !== currentSrc) {
      p5.loadImage(props.imgSrc, (loadedImage) => {
        filterManager.setOriginal(loadedImage);
        currentSrc = props.imgSrc;

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
    if (filterManager.singleFiltered) {
      p5.image(filterManager.singleFiltered, 53, 52, 62, 50);
    }

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}