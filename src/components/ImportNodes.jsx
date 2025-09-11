import { useFilter } from "../contexts/FilterContext";
import { useNode } from "../contexts/NodeContext";
import { useRef } from "react";

export default function ImportNodes(){
    const { addEdges, removeEdge, setSelectedOptions, setNodes } = useNode();
    const { setFilterValues } = useFilter();
    const fileInputRef = useRef();

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            console.log("json", json);
            json.edges.map((edge) => {
                addEdges(edge.from, edge.to);
            });
            setSelectedOptions(json.nodes.map((node) => node.label));
            setNodes(json.nodes);
            setFilterValues(json.values);
            
        } catch (err) {
            alert("Invalid JSON file");
        }
        };
        reader.readAsText(file);
    };

    return(
        <button onClick={() => fileInputRef.current.click()}>
        <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
        />
            Import Gargoyles
        </button>
    );
}