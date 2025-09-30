import './styles/App.css';
import NodeEditor from "./components/NodeEditor";
import { ImageProvider } from "./contexts/ImageContext";
import { FilterProvider } from "./contexts/FilterContext";
import { NodeProvider } from "./contexts/NodeContext";
import Menu from "./components/Menu";
import CanvasMain from "./components/MainCanvas";
import CanvasPreview from "./components/InvisibleCanvas";
import Marquee from './components/MarqueeMotd';
import CanvasWEBGL from './components/WEBGLCanvas';
import TopBar from './components/TopBar';
import EditMode from './components/EditMode';
import { ModeProvider } from './contexts/ModeContext';
import { useState } from 'react';

export default function App() {
  const [cpuFlag, setCPUFlag] = useState(false);
  return (
    <>
    <ModeProvider>
      <ImageProvider>
          <NodeProvider>
            <FilterProvider>
              <TopBar />
              <button onClick={() => setCPUFlag(!cpuFlag)}>toggle gpu</button>
            <div className="main">     
               <Menu />
              <div className="sub-main">
                {
                  cpuFlag ? 
                  (
                    <CanvasMain />
                  ) :
                  (
                    <CanvasWEBGL />
                  )
                }
                <NodeEditor />
                
                <div className="edit-mode-holder">
                  <EditMode />
                </div>
              </div>
            </div>
            <CanvasPreview />
            </FilterProvider>
          </NodeProvider>
      </ImageProvider>
      </ModeProvider>
    </>
  );
}

