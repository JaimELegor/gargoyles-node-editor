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
import CPUFlagButton from './components/CPUFlagButton';
import { ModeProvider } from './contexts/ModeContext';
import { useState } from 'react';

import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <>
    <ThemeProvider>
    <ModeProvider>
      <ImageProvider>
          <NodeProvider>
            <FilterProvider>
              <TopBar />
              
            <div className="main">     
               <Menu />
               <CPUFlagButton />
              <div className="sub-main">
                <CanvasMain />
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
      </ThemeProvider>
    </>
  );
}

