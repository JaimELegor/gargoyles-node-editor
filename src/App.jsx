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

export default function App() {
  return (
    <>
      <ImageProvider>
          <NodeProvider>
            <FilterProvider>
            <Marquee />
            <div className="main">     
               <Menu />
              <div className="sub-main">
                <CanvasMain />
                <NodeEditor />
                {/*<CanvasWEBGL />*/}
              </div>
            </div>
            <CanvasPreview />
            </FilterProvider>
          </NodeProvider>
      </ImageProvider>
    </>
  );
}

