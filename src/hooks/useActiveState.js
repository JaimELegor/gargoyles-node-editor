import { useImage } from "../contexts/ImageContext";
import { useFilter } from "../contexts/FilterContext";
import { useMemo } from "react";
import { useNode } from "../contexts/NodeContext";

export function useActiveFilter() {
  const { imgDataURL } = useImage();
  const { filterFunctions, sliderParams, filterValues } = useFilter();
  const { selectedNode } = useNode();

  const isActive = useMemo(() => {

    return Boolean(
      imgDataURL &&
        filterFunctions.length > 0 &&
        selectedNode &&
        sliderParams &&
        filterValues[selectedNode]
    );
  }, [imgDataURL, filterFunctions, selectedNode, sliderParams, filterValues]);


  return { isActive };
}
