import { ReactP5Wrapper } from "@p5-wrapper/react";
import { sketch } from "../utils/Sketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useMode } from "../contexts/ModeContext";
import ImageUploader from "./ImageUploader";
import '../styles/MainCanvas.css';
import { useState, useEffect } from "react";

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CanvasMain() {
  const { imgDataURL, setImgDataURL, setMainCanvas, setCanvasSize } = useImage();
  const { filterValues, filterFunctions } = useFilter();
  const { cpuFlag } = useMode();

  const hasFilters = filterFunctions.length > 0;
  const debouncedParamsMap = useDebouncedValue(filterValues, hasFilters ? 50 : 0);

  return (
    <div className="content-wrapper">
      <div className="content">
        {imgDataURL && (  
          <ReactP5Wrapper
            sketch={sketch}
            imgSrc={imgDataURL}
            paramsMap={debouncedParamsMap}
            filter={filterFunctions} 
            filterFlag={true}
            onCanvasImage={(canvas) => setMainCanvas(canvas)}
            onResize={({ width, height }) => setCanvasSize({ width, height })}
            cpuFlag={cpuFlag}
          />
        )}
      </div>
      <ImageUploader onImageLoad={setImgDataURL} />
    </div>
  );
}