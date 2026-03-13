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
  const edgeLinesRef = useRef({});  

  const { nodePreviews, selectedNode,
          setSelectedNode, nodes,
          setNodes, edges,
          addEdges, removeEdge } = useNode();

  const { imgDataURL } = useImage();
  const { activeMode, setActiveMode } = useMode();

  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [zoom, setZoom] = useState(1);

  const startDrag = (e, id) => {
    e.stopPropagation();
    const nodeIndex = nodes.findIndex((n) => n.id === id);
    if (nodeIndex === -1) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { x: nodes[nodeIndex].x, y: nodes[nodeIndex].y };
    const nodeEl = nodeRefs.current[id];

    const onMouseMove = (e) => {
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;
      const newX = startPos.x + dx;
      const newY = startPos.y + dy;

      // ✅ Pure DOM mutation — zero React re-renders
      if (nodeEl) {
        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
      }

      // ✅ Update connected edges directly via SVG refs
      Array.from(edges).forEach((edge, i) => {
        const parsed = JSON.parse(edge);
        const line = edgeLinesRef.current[i];
        if (!line) return;
        if (parsed.from === id) {
          line.setAttribute("x1", newX + 195);
          line.setAttribute("y1", newY + 230);
        }
        if (parsed.to === id) {
          line.setAttribute("x2", newX + 195);
          line.setAttribute("y2", newY + 230);
        }
      });
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
      setNodes(updatedNodes); // ✅ Only one setState, on mouseup
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleLinkHandle = (e, nodeId) => {
    e.stopPropagation();
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      setMousePos(null);
    } else if (connectingFrom) {
      addEdges(connectingFrom, nodeId);
      setConnectingFrom(null);
      setMousePos(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleEditHandle = (e, nodeLabel) => {
    e.stopPropagation();
    if (imgDataURL) setSelectedNode(nodeLabel);
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
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [connectingFrom]);

  useEffect(() => {
    const editor = document.getElementById("editor");
    if (!editor) return;
    const handleWheel = (e) => {
      if (activeMode !== "zoom") return;
      e.preventDefault();
      const step = 0.005;
      const delta = e.deltaY > 0 ? -step : step;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 1.5));
    };
    editor.addEventListener("wheel", handleWheel, { passive: false });
    return () => editor.removeEventListener("wheel", handleWheel);
  }, [activeMode]);

  return (
    <div className="editor-holder">
      {nodes && (
        <div
          id="editor"
          onClick={(e) => {
            if (!e.target.closest(".node")) {
              setConnectingFrom(null);
              setMousePos(null);
            }
          }}
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
            {nodes.map((node) => {
              const preview = nodePreviews.find((p) => p.name === node.label);
              const isConnecting = connectingFrom === node.id;
              const isEditing = selectedNode === node.label;

              return (
                <div
                  className={`node ${isConnecting ? "node--connecting" : ""}`}
                  key={node.id + selectedNode}
                  style={{
                    left: node.x,
                    top: node.y,
                    pointerEvents: activeMode === "zoom" ? "none" : "all",
                    cursor: activeMode === "move" ? "grab" : "auto",
                  }}
                  ref={(el) => {
                    if (el) nodeRefs.current[node.id] = el;
                  }}
                  onMouseDown={(e) => activeMode === "move" && startDrag(e, node.id)}
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
                  <div className="node-handles">
                    <div
                      className="node-handle node-handle--move"
                      title="Move node"
                      onMouseDown={(e) => {
                        setActiveMode("move");
                        startDrag(e, node.id);
                      }}
                    >
                      ✥
                    </div>
                    <div
                      className={`node-handle node-handle--link ${isConnecting ? "node-handle--active" : ""}`}
                      title={isConnecting ? "Cancel link" : "Link from this node"}
                      onClick={(e) => {
                        setActiveMode("link");
                        handleLinkHandle(e, node.id);
                      }}
                    >
                      ⇢
                    </div>
                    <div
                      className={`node-handle node-handle--edit ${isEditing ? "node-handle--active" : ""}`}
                      title="Edit node"
                      onClick={(e) => {
                        setActiveMode("edit");
                        handleEditHandle(e, node.label);
                      }}
                    >
                      ✎
                    </div>
                  </div>

                  <div className="frame-container">
                    <div className="image-wrapper">
                      {selectedNode === node.label || !preview?.url ? (
                        <div className="static">
                          {!imgDataURL && (
                            <p className="static-placeholder">submit<br/>image</p>
                          )}
                        </div>
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
                              <p style={{ filter: "url(#text-blur)", color: "white", textAlign: "center" }}>
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

            <svg ref={svgRef} id="edges">
              <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              </filter>
              <filter id="text-blur">
                <feGaussianBlur stdDeviation="1.75" />
              </filter>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#00ff88" />
                </marker>
                <marker id="arrowhead-dark" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,5 L7,2.5 z" fill="#4a4a4a" />
                </marker>
              </defs>

              {Array.from(edges).map((edge, i) => {
                const parsed = JSON.parse(edge);
                const from = getNodeById(parsed.from);
                const to = getNodeById(parsed.to);
                if (!from || !to) return null;

                return (
                  <line
                    key={i}
                    ref={(el) => { if (el) edgeLinesRef.current[i] = el; }} 
                    x1={from.x + 195} y1={from.y + 230}
                    x2={to.x + 195}   y2={to.y + 230}
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
