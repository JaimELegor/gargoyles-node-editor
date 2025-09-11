import '../styles/AsciiTree.css';
import { useState } from "react";
import { useNode } from '../contexts/NodeContext';
import { configFilter } from "../utils/configFilter";

export default function DirectoryTree(){
  
  const insertPath = (tree, path) => {
    if (!path.length) return;

    const label = path[0];
    let node = tree.find(n => n.label === label);

    if (!node) {
      node = { label, children: [] };
      tree.push(node);
    }

    if (path.length > 1) {
      if (!node.children) node.children = [];
      insertPath(node.children, path.slice(1));
    }
  };
  let paths = configFilter.map((f) => f.name);
  

  let data = [];

  paths.forEach((path) => insertPath(data, path.split("/")));

  return(
  <>
    <AsciiTree data={data}/>
  </>
  );
}

export function AsciiTree({ data, prefix = ""}) {
  const { setNodes, selectedOptions, setSelectedOptions } = useNode();
  
  
  

  const handleCheckboxChange = (option) => {
    const isChecked = !selectedOptions.includes(option);
    const nextSelected = isChecked
      ? [...selectedOptions, option]
      : selectedOptions.filter((o) => o !== option);


    setSelectedOptions(nextSelected);


    if (isChecked) {
      setNodes((prevNodes) => {
        if (prevNodes.some((n) => n.id === option)) return prevNodes;
        return [
          ...prevNodes,
          { id: option, label: option, x: 0, y: 100 + prevNodes.length * 120 },
        ];
      });
    } else {
      setNodes((prevNodes) => prevNodes.filter((n) => n.id !== option));
    }
  };

  return (
    <div className="ascii">
      {data.map((node, idx) => {
        const last = idx === data.length - 1;
        const childPrefix = prefix + (last ? "    " : "│   ");
        const [open, setOpen] = useState(false);

        return (
          <div key={node.label}
            className={`tree-row ${selectedOptions.includes(node.label) ? "selected" : ""
              }`}
          >
            <div className="tree-branch">
              {/* [+] or [-] toggle for folders */}
              {node.children?.length > 0 && (
                <span
                  className="expand-icon"
                  onClick={() => setOpen(!open)}
                >
                  {open ? "-" : "+"}
                </span>
              )}

              {/* Folder or File Icon */}
              <img
                src={
                  node.children?.length > 0
                    ? "folder.png"
                    : "file.png"
                }
                alt="icon"
                className="icon"
              />

              {/* Label */}
              <span className="label">{node.label}</span>

              {/* Checkbox for leaf nodes */}
              {node.children?.length === 0 && (
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(node.label)}
                    onChange={() => handleCheckboxChange(node.label)}
                  />
                </label>
              )}
            </div>

            {/* Render children recursively */}
            {open && node.children?.length > 0 && (
              <AsciiTree
                data={node.children}
                prefix={childPrefix}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
