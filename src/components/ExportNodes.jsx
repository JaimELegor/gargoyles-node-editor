import { useNode } from "../contexts/NodeContext";
import { useFilter } from "../contexts/FilterContext";

export default function ExportNodes() {
  const { nodes, edges } = useNode();
  const { filterValues } = useFilter();

  const handleExport = () => {
    // Build the JSON object
    const json = {
      nodes: nodes,
      edges: Array.from(edges).map((edge) => JSON.parse(edge)),
      values: filterValues,
    };

    // Stringify with pretty-print
    const dataStr = JSON.stringify(json, null, 2);

    // Create a blob and trigger download
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "nodes-preset.json"; // default filename
    a.click();

    URL.revokeObjectURL(url);
  };

  return <button onClick={handleExport}>Export Gargoyles</button>;
}