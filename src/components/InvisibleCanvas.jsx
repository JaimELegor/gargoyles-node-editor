import { ReactP5Wrapper } from "@p5-wrapper/react";
import { invisibleSketch } from "../utils/invisibleSketch";
import { monitorSketch } from "../utils/monitorSketch";
import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useNode } from "../contexts/NodeContext";
import { useMode } from "../contexts/ModeContext";
import { useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function CanvasPreview() {
  const { imgDataURL, setPreviewCanvas, setMonitorCanvas } = useImage();
  const { filterValues, filterSingle } = useFilter();
  const { selectedNode } = useNode();
  const { cpuFlag } = useMode();
  const { theme } = useTheme();

  // Freeze last valid filter so canvas doesn't clear before toBlob fires
  const lastFilterRef = useRef(filterSingle);
  if (filterSingle) lastFilterRef.current = filterSingle;
  const frozenFilter = lastFilterRef.current;

  const lastNodeRef = useRef(selectedNode);
  if (selectedNode) lastNodeRef.current = selectedNode;
  const frozenNode = lastNodeRef.current;

  if (!imgDataURL) return null;

  

  return (
    <div style={{ display: "none" }}>
      {theme === "neon" &&
          <ReactP5Wrapper
            name={frozenNode}
            paramsMap={filterValues}
            filter={frozenFilter}   // ← never goes null mid-frame
            imgSrc={imgDataURL}
            onCanvasImage={(canvas) => setMonitorCanvas(canvas)}
            sketch={monitorSketch}
            cpuFlag={cpuFlag}
          />
      }
      <ReactP5Wrapper
        key={imgDataURL}
        name={frozenNode}
        paramsMap={filterValues}
        filter={frozenFilter}   // ← same here
        imgSrc={imgDataURL}
        onCanvasImage={(canvas) => setPreviewCanvas(canvas)}
        sketch={invisibleSketch}
        cpuFlag={cpuFlag}
      />
    </div>
  );
}