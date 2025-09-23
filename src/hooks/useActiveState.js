import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useMemo } from "react";
import { useNode } from "../contexts/NodeContext";
import { useMode } from "../contexts/ModeContext";

export function useActiveFilter() {
  const { imgDataURL } = useImage();
  const { filterFunctions, sliderParams, filterValues } = useFilter();
  const { selectedNode } = useNode();
  const { activeMode } = useMode();

  const isActive = useMemo(() => {

    return Boolean(
      imgDataURL && activeMode === "edit" &&
        filterFunctions.length > 0 &&
        selectedNode &&
        sliderParams &&
        filterValues[selectedNode]
    );
  }, [imgDataURL, filterFunctions, selectedNode, sliderParams, filterValues]);


  return { isActive };
}
