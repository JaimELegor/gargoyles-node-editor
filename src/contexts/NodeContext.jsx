import { createContext, useContext, useState, useEffect } from "react";

const NodeContext = createContext();

export function NodeProvider({ children }) {
  const [nodes, setNodes] = useState([]);
  const [nodePreviews, setNodePreviews] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [singleSelected, setSingleSelected] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [edges, setEdges] = useState(new Set());
  const [order, setOrder] = useState([]);

  useEffect(() => {
    // If there are edges, let topSort decide
    if (edges.size > 0) {
      const sorted = topSort(edges);
      if (sorted) {
        setOrder(sorted);
        return;
      }
    }

    // If no edges, fallback to single-node mode
    if (selectedNode) {
     // setSingleSelected(selectedNode);
      setOrder([selectedNode]);
    } //else {
      //setOrder([]);
      //}
  }, [edges, selectedNode]);

  const topSort = (edges) => {
      // Parse edges into array of objects
      const edgeArr = Array.from(edges).map(e => JSON.parse(e));
  
      // Collect all unique node IDs
      const nodeIds = new Set();
      edgeArr.forEach(({ from, to }) => {
        nodeIds.add(from);
        nodeIds.add(to);
      });
  
      // Initialize in-degree and adjacency list
      const inDegree = {};
      const adj = {};
      nodeIds.forEach(id => {
        inDegree[id] = 0;
        adj[id] = [];
      });
  
      // Fill in-degree and adjacency
      edgeArr.forEach(({ from, to }) => {
        adj[from].push(to);
        inDegree[to]++;
      });
  
      // Queue all nodes with 0 in-degree
      const queue = [];
      for (const id of nodeIds) {
        if (inDegree[id] === 0) queue.push(id);
      }
  
      const result = [];
      while (queue.length > 0) {
        const node = queue.shift();
        result.push(node);
  
        for (const neighbor of adj[node]) {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) queue.push(neighbor);
        }
      }
  
      // If result length is less than number of nodes, we have a cycle
      if (result.length !== nodeIds.size) {
        return null;
      }
  
      return result; // array of node IDs in topological order
  };

  const addEdges = (from, to) => {
    const newEdges = new Set(edges);
    newEdges.add(JSON.stringify({ from, to }));
    if (topSort(newEdges) === null) {
      newEdges.delete(JSON.stringify({ from, to }));
    }
    setEdges(newEdges);

  };

  const removeEdge = (edge) => {
    const newEdges = new Set(edges);
    newEdges.delete(edge);
    setEdges(newEdges);

  };

  return (
    <NodeContext.Provider value={{
      nodes, setNodes,
      nodePreviews, setNodePreviews,
      selectedNode, setSelectedNode,
      lastSelected, setLastSelected,
      selectedOptions, setSelectedOptions,
      edges, setEdges, addEdges,
      removeEdge, order, setOrder,
      singleSelected, setSingleSelected
    }}>
      {children}
    </NodeContext.Provider>
  );
}

export function useNode() {
  return useContext(NodeContext);
}
