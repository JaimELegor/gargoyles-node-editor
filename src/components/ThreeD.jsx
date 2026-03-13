import { useNode } from '../contexts/NodeContext';
import { useImage } from '../contexts/ImageContext';
import { useFilter } from '../contexts/FilterContext';
import '../styles/ThreeD.css';
import Slider from "./Slider";
import CodeViewer from './CodeViewer';
import TVModel from './TVModel';
import { useTheme } from "../contexts/ThemeContext";

export default function ThreeScene() {
  const { selectedNode, setSelectedNode, setLastSelected } = useNode();
  const { monitorCanvas, previewCanvas } = useImage();
  const { filterValues, sliderParams, setFilterValues } = useFilter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="model">
      { theme === "neon" ?
        <TVModel monitorCanvas={monitorCanvas} />
        :
        <div ref={(el) => {
          if (el && previewCanvas) {
            el.innerHTML = "";
            el.appendChild(previewCanvas);
          }
        }} />
      }
      
      {Object.entries(sliderParams).map(([paramName, paramData]) => (
        <Slider
          key={paramName}
          label={paramName}
          min={paramData.min}
          max={paramData.max}
          step={paramData.step}
          value={filterValues[selectedNode][paramName]}
          onChange={(newValue) => {
            setFilterValues(prev => ({
              ...prev,
              [selectedNode]: {
                ...prev[selectedNode],
                [paramName]: newValue,
              },
            }));
          }}
        />
      ))}

      <button onClick={() => { setLastSelected(selectedNode); setSelectedNode(null); }}>
        Apply
      </button>
    </div>
  );
}
