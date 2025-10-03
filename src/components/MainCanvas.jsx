import { ReactP5Wrapper } from "@p5-wrapper/react";
import { sketch } from "../utils/Sketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useMode } from "../contexts/ModeContext";
import ImageUploader from "./ImageUploader";
import '../styles/MainCanvas.css';

export default function CanvasMain() {
  const { imgDataURL, setImgDataURL, setMainCanvas, setCanvasSize } = useImage();
  const { filterValues, filterFunctions } = useFilter();
  const { cpuFlag } = useMode();
  return (
    <div className="content-wrapper">
    <div className="content">
                        {imgDataURL && (
                          <>
                            <ReactP5Wrapper
                              sketch={sketch}
                              imgSrc={imgDataURL}
                              paramsMap={filterValues}
                              filter={filterFunctions}
                              filterFlag={true}
                              onCanvasImage={(canvas) => setMainCanvas(canvas)} 
                              onResize={({ width, height }) => {
                                    setCanvasSize({ width, height });
                                  }}
                              cpuFlag={cpuFlag}
                            />
                          </>
                        )}
      </div>
      <ImageUploader onImageLoad={setImgDataURL} />
    </div>
    
  );
}