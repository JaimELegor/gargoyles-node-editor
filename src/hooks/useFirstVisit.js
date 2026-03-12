import { useEffect } from "react";
import { useNode } from "../contexts/NodeContext";
import { useFilter } from "../contexts/FilterContext";
import { useImage } from "../contexts/ImageContext";
import EXAMPLE_IMAGE from "../../public/kitten.png";

const EXAMPLE_CONFIG = {
  nodes: [
    { id: "DITHER/ErrorDiffusion/Atkinson", label: "Atkinson", x: 23,  y: 397 },
    { id: "COLOR/Tone/Duotone",             label: "Duotone",  x: 289, y: 413 }
  ],
  edges: [
    { from: "DITHER/ErrorDiffusion/Atkinson", to: "COLOR/Tone/Duotone" }
  ],
  values: {
    Atkinson: { levels: 1, spread: 1 },
    Duotone: {
      shadowR: 192, shadowG: 0,   shadowB: 0,
      highlightR: 64, highlightG: 255, highlightB: 255
    }
  }
};

export function useFirstVisit() {
  const { addEdges, setSelectedOptions, setNodes } = useNode();
  const { setFilterValues } = useFilter();
  const { setImgDataURL } = useImage();

  useEffect(() => {
    if (localStorage.getItem("gargoyles-visited")) return;

    EXAMPLE_CONFIG.edges.forEach((edge) => addEdges(edge.from, edge.to));
    setSelectedOptions(EXAMPLE_CONFIG.nodes.map((n) => n.label));
    setNodes(EXAMPLE_CONFIG.nodes);
    setFilterValues(EXAMPLE_CONFIG.values);
    setImgDataURL(EXAMPLE_IMAGE);

    localStorage.setItem("gargoyles-visited", "true");
  }, []);
}