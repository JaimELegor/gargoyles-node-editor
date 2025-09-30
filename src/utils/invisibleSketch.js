import { filterManager } from "./FilterManager";

export function invisibleSketch(p5) {
  let currentSrc = null;
  let onCanvasImage;
  let filters = [];
  let paramsMap = {};
  let name;

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
    p5.createCanvas(225, 225);
  };

  p5.draw = () => {
    if (filterManager.singleFiltered) {
      p5.image(filterManager.singleFiltered, 0, 0, 225, 225);
    }

    if (onCanvasImage && p5.canvas) {
      onCanvasImage(p5.canvas);
    }
  };
}