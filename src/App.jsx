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
import CodeViewer from './components/CodeViewer';
import { ThemeProvider } from './contexts/ThemeContext';
import { useActiveFilter } from "./hooks/useActiveState";
import { AuthProvider } from './contexts/AuthContext';
import GithubAuthButton from './components/GitHubAuthBtn';
import { FilterRegistryProvider } from './contexts/FilterRegistryContext';
import { useFirstVisit } from './hooks/useFirstVisit';
import { useNode } from './contexts/NodeContext';

function AppContent() {
  const { nodePreviews } = useNode();
  useFirstVisit();
  return (
    <>
     <TopBar />
      <div className="main">     
        <Menu />
        <CPUFlagButton />
        <div className="sub-main">
          <CanvasMain />
          <NodeEditor />
                
        <div className="right-panel">
          {/*<div className="edit-mode-holder">
            <EditMode />
          </div>
          */}
          
        </div>
        </div>
        <GithubAuthButton />
      </div>
      <CanvasPreview />
    </>
  );
}

export default function App() {
  return (
    <FilterRegistryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ModeProvider>
            <ImageProvider>
              <NodeProvider>
                <FilterProvider>
                  <AppContent />
                </FilterProvider>
              </NodeProvider>
            </ImageProvider>
          </ModeProvider>
        </ThemeProvider>
      </AuthProvider>
    </FilterRegistryProvider>

  );
}