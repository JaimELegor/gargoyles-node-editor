import { ReactP5Wrapper } from "@p5-wrapper/react";
import { WEBGLSketch } from "../utils/webGLSketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import ImageUploader from "./ImageUploader";
import '../styles/MainCanvas.css';

export default function CanvasWEBGL() {
  const { imgDataURL, setImgDataURL, setMainCanvas, setCanvasSize } = useImage();
  const { filterValues, filterFunctions } = useFilter();



  return (
    <div className="content-wrapper">
        <div className="content">
                        {imgDataURL && (
                          <>
                            <ReactP5Wrapper
                              sketch={WEBGLSketch}
                              imgSrc={imgDataURL}
                              paramsMap={filterValues}
                              filter={filterFunctions}
                              filterFlag={true}
                              onCanvasImage={(canvas) => setMainCanvas(canvas)} 
                              onResize={({ width, height }) => {
                                    setCanvasSize({ width, height });
                                  }}
                            />
                          </>
                        )}
          </div>
          <ImageUploader onImageLoad={setImgDataURL} />
        </div>
    
  );
}