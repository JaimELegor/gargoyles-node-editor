import { createContext, useContext, useState, useEffect } from "react";
import { useFilterRegistry } from "./FilterRegistryContext";
import { useNode } from "./NodeContext";
import { useImage } from "./ImageContext";
import { useRef } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const { registry, findFilter, ready } = useFilterRegistry();
  const [filterFunctions, setFilterFunctions] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [filterSingle, setFilterSingle] = useState(null);
  const [sliderParams, setSliderParams] = useState(null);
  

  const { selectedNode, nodePreviews, setNodePreviews,
          lastSelected, setLastSelected, edges, setEdges,
          order, setOrder, singleSelected, setSingleSelected } = useNode();
  const { previewCanvas, previewCanvasRef } = useImage();
  const prevSelectedNode = useRef(null);

  useEffect(() => {
    if (!ready) return; // wait for DB
    const updated = order.map((name) => {
      const filter = findFilter(name);
      if (!filter) return null;
      return {
        name,
        func: (...args) => filter.processFunc(...args),
        processFunc: filter.processFunc,
        shader: filter.shader,
      };
    }).filter(Boolean);
    setFilterFunctions(updated);
    setNodePreviews((prev) => {
      const map = new Map(prev.map(p => [p.name, p]));
      return order.map((name) => map.get(name) ?? { name, blob: null });
    });
    console.log(order);
  }, [order, ready, registry]); // re-runs when registry changes live

  useEffect(() => {
    if (!ready) return;

    if (selectedNode) {
      // Node was just selected (or registry updated while selected)
      prevSelectedNode.current = selectedNode;
      setLastSelected(selectedNode);
      const filter = findFilter(selectedNode);
      setSliderParams(filter?.params ?? null);
      setFilterSingle(() => filter ?? null);
      return;
    }

    // selectedNode is null, only snapshot if we transitioned FROM a node
   if (prevSelectedNode.current) {
    const nameToSnapshot = prevSelectedNode.current;
    prevSelectedNode.current = null;

    // Use the ref — guaranteed to be the LAST rendered frame, not post-clear
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      setNodePreviews((prev) =>
        prev.map((p) => {
          if (p.name === nameToSnapshot) {
            if (p.url) URL.revokeObjectURL(p.url);
            return { ...p, blob, url: URL.createObjectURL(blob) };
          }
          return p;
        })
      );
    }, "image/webp", 0.8); // webp saves ~60% size vs PNG
  }

  }, [selectedNode, ready, registry]);

  useEffect(() => {
    if (!ready) return;
    const newFilterValues = {};
    order.forEach(name => {
      const filter = findFilter(name);
      if (filter) {
        newFilterValues[name] = {};
        Object.entries(filter.params).forEach(([paramName, param]) => {
          newFilterValues[name][paramName] =
            filterValues?.[name]?.[paramName] !== undefined
              ? filterValues[name][paramName]
              : param.value;
        });
      }
    });
    setFilterValues(newFilterValues);
  }, [order, ready, registry]);

  return (
    <FilterContext.Provider value={{
      order, setOrder, filterFunctions, setFilterFunctions,
      filterValues, setFilterValues, filterSingle, setFilterSingle,
      sliderParams, setSliderParams
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}