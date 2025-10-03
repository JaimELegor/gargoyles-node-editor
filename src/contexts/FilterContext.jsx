import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { configFilter } from "../utils/configFilter";
import { useNode } from "./NodeContext";
import { useImage } from "./ImageContext";
import { disposeBackends } from "../utils/backends";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  
  const [filterFunctions, setFilterFunctions] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [filterSingle, setFilterSingle] = useState(null);
  const [sliderParams, setSliderParams] = useState(null);
  const { selectedNode, nodePreviews, 
          setNodePreviews, lastSelected, 
          setLastSelected, edges, setEdges,
          order, setOrder
         } = useNode();

  const { previewCanvas } = useImage();

  useEffect(() => {
    const updated = order.map((name) => {
      const filter = configFilter.find(
        (f) => name === f.name.split("/").slice(-1)[0]
      );
      if (!filter) return null;

      return {
        name,                         // short name for identification
        func: (...args) => filter.processFunc(...args), // processing function
        shader: filter.shader,
      };
    }).filter(Boolean); // remove any nulls
    setFilterFunctions(updated);
    const previews = order.map((name) => { return { name, blob: null }; });
    setNodePreviews(previews);
  }, [order]);

  useEffect(() => {
    if (selectedNode) {
      setLastSelected(selectedNode);
      setSliderParams(configFilter.find(
        (filter) => selectedNode === filter.name.split("/")[filter.name.split("/").length - 1]
      ).params);
      setFilterSingle(() => configFilter.find(
        (filter) => selectedNode === filter.name.split("/")[filter.name.split("/").length - 1]
      ));
    }

    if (!selectedNode && lastSelected && previewCanvas) {
      console.log("preview canvas saved");
      previewCanvas.toBlob((blob) => {
        if (!blob) return;

        setNodePreviews((prev) =>
          prev.map((p) => {
            if (p.name === lastSelected) {
              if (p.url) URL.revokeObjectURL(p.url); // cleanup old one
              return { ...p, blob, url: URL.createObjectURL(blob) };
            }
            return p;
          })
        );
      });
    }


  }, [selectedNode, lastSelected]);

useEffect(() => {
  const newFilterValues = {};
  order.forEach(name => {
    const filter = configFilter.find(f => f.name.split("/").slice(-1)[0] === name);
    if (filter) {
      newFilterValues[name] = {};
      Object.entries(filter.params).forEach(([paramName, param]) => {
        // keep imported value if available, otherwise fall back to default
        newFilterValues[name][paramName] =
          (filterValues?.[name]?.[paramName] !== undefined)
            ? filterValues[name][paramName]
            : param.value;
      });
    }
  });
  setFilterValues(newFilterValues);
}, [order]);


  return (
    <FilterContext.Provider value={{ 
      order, setOrder, filterFunctions, 
      setFilterFunctions, filterValues, 
      setFilterValues, filterSingle, 
      setFilterSingle, sliderParams, 
      setSliderParams 
      }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}

