import React, { useRef, useState, useEffect } from "react";
import "../styles/NodeEditor.css";
import { useNode } from "../contexts/NodeContext";
import { useFilter } from "../contexts/FilterContext";
import { useImage } from "../contexts/ImageContext";

export default function NodeEditor() {
  const svgRef = useRef();
  const editorRef = useRef({});
  const nodeRefs = useRef({});

  const { nodePreviews, selectedNode, 
          setSelectedNode, nodes, 
          setNodes, edges,
          addEdges, removeEdge } = useNode();

  const { imgDataURL } = useImage();

  
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleMouseDown = (e, id) => {
    const nodeIndex = nodes.findIndex((n) => n.id === id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { x: nodes[nodeIndex].x, y: nodes[nodeIndex].y };

    const onMouseMove = (e) => {
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      const updatedNodes = [...nodes];
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        x: startPos.x + dx,
        y: startPos.y + dy,
      };

      if (setNodes) setNodes(updatedNodes);
    };

    const onMouseUp = () => {
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



  return (
    <div className="editor-holder">
                  {nodes && (
                    <div
      id="editor"
      onWheel={(e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1; // scroll down = zoom out, up = zoom in
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.25), 1.5)); // clamp between 0.25x and 1.5x
      }}
    >
      <div
        className="zoom-container"
        style={{
          zoom: zoom, // works for both nodes and SVG edges
        }}
      >
        {/* Nodes */}
        {nodes.map((node) => {
          const preview = nodePreviews.find((p) => p.name === node.label);
          return (
            <div
              className="node"
              key={node.id + selectedNode}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              style={{ left: node.x, top: node.y }}
            >
              <div
                className="frame-container"
                onClick={() => {
                  imgDataURL && setSelectedNode(node.label); 
                }}
                ref={(el) => {
                  if (el) nodeRefs.current[node.id] = el;
                }}
              >
                <div className="image-wrapper">
                  {selectedNode === node.label || !preview?.url ? (
                    <div className="static" />
                  ) : (
                    <>
                      <img
                        className="canvas-slot"
                        src={preview.url}
                        alt={node.label}
                      />
                      <div className="hover-overlay">
                        <svg style={{ display: "none" }}>
                          <filter id="text-blur">
                            <feGaussianBlur stdDeviation="1.75" />
                          </filter>
                        </svg>
                        <p style={{ filter: "url(#text-blur)", color: "white", textAlign: "center" }}>SELECT <br /> GARGOYLE</p>
                      </div>
                    </>
                  )}
                </div>

                <img src="monitor.png" className="frame-overlay" alt="Frame" />

                <svg className="clickable-overlay" viewBox="0 0 300 300">
                  <ellipse
                    cx="235"
                    cy="270"
                    rx="5"
                    ry="5"
                    fill="rgba(255, 0, 0, 0.3)"
                    stroke="red"
                    strokeWidth="2"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    }}
                  />
                </svg>
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

            return (
              <line
                key={i}
                x1={from.x + 195}
                y1={from.y + 230}
                x2={to.x + 195}
                y2={to.y + 230}
                className="edge-line"
                onClick={() => {

                  removeEdge(edge);

                }}
              />
            );
          })}

          {connectingFrom && mousePos && (
            <line
              //x1={getNodeById(connectingFrom).x * zoom + (235 / 300) * nodeSize.width}
              x1={getNodeById(connectingFrom).x + 195}
              //y1={getNodeById(connectingFrom).y * zoom + (270 / 300) * nodeSize.height}
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

