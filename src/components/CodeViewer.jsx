import { useEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript"; 
import "prismjs/components/prism-clike"; 
import "prismjs/themes/prism-tomorrow.css";   
import FloatingWindow from "./FloatingWindow";

import { useFilter } from "../contexts/FilterContext";
import { useMode } from "../contexts/ModeContext";
import "../styles/CodeViewer.css";
import NodeForm from "./NodeForm";

export default function CodeViewer() {
  const { filterSingle } = useFilter();
  const { cpuFlag } = useMode();
  const codeRef = useRef(null);
  const [openEditor, setOpenEditor] = useState(false);

  const code = useMemo(
    () => (cpuFlag ? filterSingle.processFunc.toString() : filterSingle.shader.toString()),
    [cpuFlag, filterSingle]
  );

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current);
  }, [code, openEditor]);

  return (
    <>

    {openEditor ?
      (<FloatingWindow 
          open={openEditor}
          onClose={() => setOpenEditor(close)}
          title="Code"
        >
          <NodeForm/>
        </FloatingWindow> 
      )
        :
     ( 
     <>
     <div className="code-col">
        <div className="code-viewer">
          <pre className="codePre">
            <code ref={codeRef} className={"language-"+ (cpuFlag ? "javascript" : "clike") }>
              {code}
            </code>
          </pre>
        </div>
        <button onClick={() => setOpenEditor(true)}>Edit gargoyle</button>
     </div>

      </>
      )

        
}
      
    </>
    
  );
}