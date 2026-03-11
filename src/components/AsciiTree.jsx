import '../styles/AsciiTree.css';
import { useState, useMemo } from "react";
import { useNode } from '../contexts/NodeContext';
import { useFilterRegistry } from "../contexts/FilterRegistryContext";

import FloatingWindow from "../components/FloatingWindow";
import NodeForm from "../components/NodeForm";

/* ============================= */
/*        DIRECTORY TREE         */
/* ============================= */

export default function DirectoryTree() {
  const { registry, ready } = useFilterRegistry();

  const data = useMemo(() => {
    if (!registry) return [];

    const insertPath = (tree, path) => {
      if (!path.length) return;

      const label = path[0];
      let node = tree.find(n => n.label === label);

      if (!node) {
        node = { label, children: [] };
        tree.push(node);
      }

      if (path.length > 1) {
        insertPath(node.children, path.slice(1));
      }
    };

    const treeData = [];
    registry.forEach((f) => {
      insertPath(treeData, f.name.split("/"));
    });

    return treeData;
  }, [registry]);

  if (!ready) return <div>Loading filters...</div>;

  return <AsciiTree data={data} currentPath={[]} />;
}

/* ============================= */
/*           ASCII TREE          */
/* ============================= */

export function AsciiTree({ data, currentPath = [] }) {

  const { setNodes, selectedOptions, setSelectedOptions } = useNode();
  const { saveFilter } = useFilterRegistry();

  /* ---------- Expansion State ---------- */
  const [openNodes, setOpenNodes] = useState({});

  const toggleNode = (pathKey) => {
    setOpenNodes(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }));
  };

  /* ---------- Floating Form ---------- */
  const [openEditor, setOpenEditor] = useState(false);
  const [formPath, setFormPath] = useState([]);

  /* ---------- Checkbox Logic ---------- */
  const handleCheckboxChange = (fullPath) => {
    const isChecked = !selectedOptions.includes(fullPath);

    const nextSelected = isChecked
      ? [...selectedOptions, fullPath]
      : selectedOptions.filter((o) => o !== fullPath);

    setSelectedOptions(nextSelected);

    if (isChecked) {
      setNodes((prevNodes) => {
        if (prevNodes.some((n) => n.id === fullPath)) return prevNodes;

        return [
          ...prevNodes,
          {
            id: fullPath,
            label: fullPath.split("/").at(-1),
            x: 0,
            y: 100 + prevNodes.length * 120,
          },
        ];
      });
    } else {
      setNodes(prevNodes =>
        prevNodes.filter(n => n.id !== fullPath)
      );
    }
  };

  /* ---------- Add Category ---------- */
  const handleAddCategory = async (path) => {
    const newCategory = prompt("New category name:");
    if (!newCategory) return;

    const fullPath = [...path, newCategory].join("/");

    await saveFilter({
      name: fullPath + "/__placeholder__",
      type: "__category__",
      code: "",
      params: [],
      processFunc: () => {} 
    });

    // auto-expand parent
    setOpenNodes(prev => ({
      ...prev,
      [path.join("/")]: true
    }));
  };

  /* ---------- Add Gargoyle ---------- */
  const handleAddGargoyle = (path) => {
    setFormPath(path);
    setOpenEditor(true);
  };

  return (
    <>
      <div className="ascii">

        {data.map((node) => {

          const fullPath = [...currentPath, node.label];
          const pathKey = fullPath.join("/");
          const isOpen = openNodes[pathKey];
          const hasChildren = node.children?.length > 0;

          if (node.label === "__placeholder__") return;

          return (
            <div key={pathKey} className="tree-row">

              <div className="tree-branch">

                {hasChildren && (
                  <span
                    className="expand-icon"
                    onClick={() => toggleNode(pathKey)}
                  >
                    {isOpen ? "-" : "+"}
                  </span>
                )}

                <img
                  src={hasChildren ? "folder.png" : "file.png"}
                  alt="icon"
                  className="icon"
                />

                <span className="label">
                  {node.label}
                </span>

                {!hasChildren && (
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(pathKey)}
                      onChange={() => handleCheckboxChange(pathKey)}
                    />
                  </label>
                )}

              </div>

              {isOpen && hasChildren && (
                <AsciiTree
                  data={node.children}
                  currentPath={fullPath}
                />
              )}

            </div>
          );
        })}

        {/* ===== SINGLE EXTRA CHILD FOR THIS LEVEL ===== */}
        <div className="tree-row add-row">
          <div className="tree-branch level-actions">

            <button
              onClick={() => handleAddCategory(currentPath)}
            >
              Category.Add
            </button>

            <button
              onClick={() => handleAddGargoyle(currentPath)}
            >
              Gargoyle.Add
            </button>

          </div>
        </div>

      </div>

      {openEditor && (
      <FloatingWindow
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        title="New Gargoyle"
      >
        <NodeForm
          path={formPath.join("/")}
          initialValue={{        // ← forces the empty-fields branch
            name: "",
            icon: "",
            params: [{ paramName: "", value: 0, min: 0, max: 1, step: 0.01 }],
            processFunc: "",
            shader: "",
          }}
        />
      </FloatingWindow>
    )}

    </>
  );
}