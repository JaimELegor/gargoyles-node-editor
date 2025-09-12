import { ReactP5Wrapper } from "@p5-wrapper/react";
import { WEBGLSketch } from "../utils/webGLSketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import ImageUploader from "./ImageUploader";
import { useState } from "react";
import '../styles/MainCanvas.css';
import Slider from "./Slider";

export default function CanvasWEBGL() {
  const { imgDataURL } = useImage();
  const [filterValues, setFilterValues] = useState({
  contrast: { amount: 0 }  // safe default
});
  const filterFunctions = [{name:"contrast", shader:"precision mediump float;\nuniform sampler2D tex;\nuniform vec2 resolution;\nuniform float amount;\nvarying vec2 vTexCoord;\nvoid main() {\n  vec4 color = texture2D(tex, vTexCoord);\n  float c = (1.0 + amount) / (1.0 - amount);\n  vec3 adj = (color.rgb - 0.5) * c + 0.5;\n  adj = clamp(adj, 0.0, 1.0);\n  gl_FragColor = vec4(adj, color.a);\n}"}];
  


  return (
    <div className="webgl">
                        {imgDataURL && (
                          <>
                            <ReactP5Wrapper
                              sketch={WEBGLSketch}
                              imgSrc={imgDataURL}
                              paramsMap={filterValues}
                              filter={filterFunctions}
                              filterFlag={true}
                              //onCanvasImage={(canvas) => setMainCanvas(canvas)} 
                            />
                            <Slider
                                      key={"contrast-amount"}
                                      label={"amount"}
                                      min={-0.9}
                                      max={0.9}
                                      step={0.1}
                                      value={filterValues?.contrast?.amount ?? 0} // fallback to 0
                                      onChange={(newValue) => {
                                        setFilterValues(prev => ({
                                          contrast: {
                                            amount: newValue,
                                          },
                                        }));
                                      }}
                                    />
                          </>
                        )}
      </div>
    
  );
}