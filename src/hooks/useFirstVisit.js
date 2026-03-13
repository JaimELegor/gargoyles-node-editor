import { useEffect, useRef } from "react";
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

const LABELS = EXAMPLE_CONFIG.nodes.map((n) => n.label);

export function useFirstVisit() {
  const { addEdges, setSelectedOptions, setNodes, setSelectedNode, nodePreviews } = useNode();
  const { setFilterValues } = useFilter();
  const { setImgDataURL, previewCanvas } = useImage();

  const started       = useRef(false);
  const warmupIndex   = useRef(-1);
  const deselectFired = useRef(false);

  useEffect(() => {
    if (localStorage.getItem("gargoyles-visited")) return;
    EXAMPLE_CONFIG.edges.forEach((edge) => addEdges(edge.from, edge.to));
    setSelectedOptions(EXAMPLE_CONFIG.nodes.map((n) => n.label));
    setNodes(EXAMPLE_CONFIG.nodes);
    setFilterValues(EXAMPLE_CONFIG.values);
    setImgDataURL(EXAMPLE_IMAGE);
    localStorage.setItem("gargoyles-visited", "true");
  }, []);

  useEffect(() => {
    if (started.current) return;
    if (!previewCanvas) return;
    started.current = true;

    // Select first node, wait 500ms for p5 to draw, then deselect
    setTimeout(() => {
      warmupIndex.current = 0;
      deselectFired.current = false;
      setSelectedNode(LABELS[0]);
      setTimeout(() => setSelectedNode(null), 500);
    }, 100);
  }, [previewCanvas]);

  useEffect(() => {
    if (warmupIndex.current < 0) return;
    const i = warmupIndex.current;
    if (i >= LABELS.length) return;

    const label = LABELS[i];
    const hasUrl = nodePreviews.find((p) => p.name === label)?.url;

    if (hasUrl) {
      const next = i + 1;
      warmupIndex.current = next;
      deselectFired.current = false;
      if (next < LABELS.length) {
        // Select next node, wait 500ms for p5 to draw, then deselect
        setTimeout(() => {
          setSelectedNode(LABELS[next]);
          setTimeout(() => setSelectedNode(null), 500);
        }, 50);
      } else {
        setSelectedNode(null);
      }
    }
  }, [nodePreviews]);
}