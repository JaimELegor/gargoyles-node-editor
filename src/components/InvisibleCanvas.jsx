import { ReactP5Wrapper } from "@p5-wrapper/react";
import { invisibleSketch } from "../utils/invisibleSketch";
import { monitorSketch } from "../utils/monitorSketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useNode } from "../contexts/NodeContext";
import { useMode } from "../contexts/ModeContext";

export default function CanvasPreview() {
  const { imgDataURL, setPreviewCanvas, setMonitorCanvas } = useImage();
  const { filterValues, filterSingle } = useFilter();
  const { selectedNode } = useNode();
  const { cpuFlag } = useMode();

  if (!imgDataURL) return null;

  return (
    <div style={{ display: "none" }}>
              
                <ReactP5Wrapper 
                    name={selectedNode} 
                    paramsMap={filterValues} 
                    filter={filterSingle} 
                    imgSrc={imgDataURL} 
                    onCanvasImage={(canvas) => setMonitorCanvas(canvas)} 
                    sketch={monitorSketch} 
                    cpuFlag = {cpuFlag}
                />

                <ReactP5Wrapper
                    key={imgDataURL + selectedNode}
                    name={selectedNode} 
                    paramsMap={filterValues} 
                    filter={filterSingle} 
                    imgSrc={imgDataURL} 
                    onCanvasImage={(canvas) => setPreviewCanvas(canvas)} //here's where it gets stored
                    sketch={invisibleSketch} 
                    cpuFlag = {cpuFlag}
                />
             
            </div>       
  ); 
}