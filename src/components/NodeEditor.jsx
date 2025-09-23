import React, { useRef, useState, useEffect } from "react";
import "../styles/NodeEditor.css";
import { useNode } from "../contexts/NodeContext";
import { useFilter } from "../contexts/FilterContext";
import { useImage } from "../contexts/ImageContext";
import { useMode } from "../contexts/ModeContext"; 

export default function NodeEditor() {
  const svgRef = useRef();
  const editorRef = useRef({});
  const nodeRefs = useRef({});

  const { nodePreviews, selectedNode, 
          setSelectedNode, nodes, 
          setNodes, edges,
          addEdges, removeEdge } = useNode();

  const { imgDataURL } = useImage();
  const { activeMode } = useMode(); 

  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(null);
  

const handleMouseDown = (e, id) => {
  if (activeMode !== "move") return;
  const nodeIndex = nodes.findIndex((n) => n.id === id);
  if (nodeIndex === -1) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const startPos = { x: nodes[nodeIndex].x, y: nodes[nodeIndex].y };

  const onMouseMove = (e) => {
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;


    const newX = startPos.x + dx;
    const newY = startPos.y + dy;

    const nodeEl = nodeRefs.current[id];
    if (nodeEl) {
      nodeEl.style.left = `${newX}px`;
      nodeEl.style.top = `${newY}px`;
    }

    setDragging({ id, x: newX, y: newY });
  };

  const onMouseUp = (e) => {
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;

    const updatedNodes = [...nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      x: startPos.x + dx,
      y: startPos.y + dy,
    };
    if (setNodes) setNodes(updatedNodes);
    setDragging(null);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

  const getNodeById = (id) => nodes.find((n) => n.id === id);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!connectingFrom || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left), y: (e.clientY - rect.top) });
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setConnectingFrom(null);
        setMousePos(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [connectingFrom]);

  useEffect(() => {
    const editor = document.getElementById("editor");
    if (!editor) return;

    const handleWheel = (e) => {
      if (activeMode !== "zoom") return;
      e.preventDefault();
      const step = 0.005; // adjust this to taste (0.01 = very smooth, 0.05 = faster)
      const delta = e.deltaY > 0 ? -step : step;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 1.5));
    };

    editor.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      editor.removeEventListener("wheel", handleWheel);
    };
  }, [activeMode]);

  return (
    <div className="editor-holder">
      {nodes && (
        <div
          id="editor"
        >
          <div
            className="zoom-container"
            style={{
              zoom: zoom,
              height: activeMode === "zoom" ? "100%" : "auto", 
              cursor: activeMode === "zoom" ? "grab" : "auto",
              pointerEvents: activeMode === "zoom" ? "all" : "none",
            }}
          >
            {/* Nodes */}
            {nodes.map((node) => {
              const preview = nodePreviews.find((p) => p.name === node.label);

              return (
                <div
                  className="node"
                  key={node.id + selectedNode}
                  style={{ 
                    left: node.x, 
                    top: node.y, 
                    pointerEvents: activeMode === "zoom" ? "none" : "all", 
                    cursor: activeMode === "move" ? "grab" : "auto"
                  }}
                  ref={(el) => {
                    if (el) nodeRefs.current[node.id] = el;
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeMode === "edit") {
                      imgDataURL && setSelectedNode(node.label);
                    } else if (activeMode === "link") {
                      if (!connectingFrom) {
                        setConnectingFrom(node.id);
                      } else if (connectingFrom !== node.id) {
                        addEdges(connectingFrom, node.id);
                        setConnectingFrom(null);
                        setMousePos(null);
                      } else {
                        setConnectingFrom(null);
                        setMousePos(null);
                      }
                    }
                  }}
                >
                  <div className="frame-container" >
                    <div className="image-wrapper">
                      {selectedNode === node.label || !preview?.url ? (
                        <div className="static" />
                      ) : (
                        <>
                          <img
                            className={`canvas-slot ${activeMode === "move" ? "disable-cursor" : ""}`}
                            src={preview.url}
                            alt={node.label}
                            draggable={false}
                          />
                          {(activeMode === "edit" || activeMode === "link") && (
                            <div className="hover-overlay" style={{ cursor: (activeMode === "edit" || activeMode === "link") ? "pointer" : "default" }}>
                              <svg style={{ display: "none" }}>
                                <filter id="text-blur">
                                  <feGaussianBlur stdDeviation="1.75" />
                                </filter>
                              </svg>
                              <p
                                style={{
                                  filter: "url(#text-blur)",
                                  color: "white",
                                  textAlign: "center",
                                }}
                              >
                                SELECT <br /> GARGOYLE
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <img src="monitor.png" className="frame-overlay" alt="Frame" />
                  </div>
                  <p>{node.label}</p>
                </div>
              );
            })}

            {/* Edges */}
            <svg ref={svgRef} id="edges">
              <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              </filter>

            {Array.from(edges).map((edge, i) => {
              const parsed = JSON.parse(edge);
              const from = getNodeById(parsed.from);
              const to = getNodeById(parsed.to);
              if (!from || !to) return null;

              const fromX = dragging?.id === from.id ? dragging.x : from.x;
              const fromY = dragging?.id === from.id ? dragging.y : from.y;
              const toX   = dragging?.id === to.id   ? dragging.x : to.x;
              const toY   = dragging?.id === to.id   ? dragging.y : to.y;

              return (
                <line
                  key={i}
                  x1={fromX + 195}
                  y1={fromY + 230}
                  x2={toX + 195}
                  y2={toY + 230}
                  className="edge-line"
                  onClick={() => removeEdge(edge)}
                />
              );
            })}

              {connectingFrom && mousePos && (
                <line
                  x1={getNodeById(connectingFrom).x + 195}
                  y1={getNodeById(connectingFrom).y + 230}
                  x2={mousePos.x / zoom}
                  y2={mousePos.y / zoom}
                  stroke="black"
                  strokeWidth="4"
                  filter="url(#blurFilter)"
                  strokeDasharray="10"
                />
              )}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}