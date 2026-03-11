import { useState } from "react";
import Tab from "./Tabs";
import Tabs from "./Tabs";
import Window from "./Window";
import DirectoryTree from "./AsciiTree";
import { useActiveFilter } from "../hooks/useActiveState";
import { useNode } from "../contexts/NodeContext";
import { useTheme } from "../contexts/ThemeContext";  
import ThreeScene from "./ThreeD";
import DownloadButton from "./ImageDownloader";
import '../styles/Menu.css';
import ImportNodes from "./ImportNodes";
import ExportNodes from "./ExportNodes";
import CodeViewer from "./CodeViewer";
import Store from "./Store";
import FloatingWindow from "./FloatingWindow";



export default function Menu(){
    const { isActive } = useActiveFilter();
    const { setSelectedNode } = useNode();
    const { theme } = useTheme();  
    const [ toggleCodeV, setToggleCodeV ] = useState(false); 
    
    const logoImage = theme === 'dark' ? '/logo-dark.png' : '/logo2.png';

    const [ showStore, setShowStore ] = useState(false);
    
    return (
    <div className="menu-parent"> 
        {isActive ? (
            <>
            <Window title="model.glb" close={() => setSelectedNode(null)}>
                    <div className='editor'>
                          <div className='visualizer'>
                            <div className="toggle-code-viewer" style={{textAlign: 'right'}}>
                              <p className="vc-btn" 
                                 onClick={() => setToggleCodeV(!toggleCodeV)} >
                                    {"<<View Code>>"}
                                </p>
                            </div>
                            <ThreeScene />
                          </div>
                      {toggleCodeV && (
                        
                            <CodeViewer />
                        
                      )}
                    </div>
                
            </Window>
        </>
        
        ) : (
            <Window title="MENU">
            <div 
                className="logo"
                style={{ backgroundImage: `url(${logoImage})` }}
            />
            <Tabs>
            <Tab label="Gargoyles.Inventory">
                <DirectoryTree />   
            </Tab>
            <Tab label="File">
                <DownloadButton />
                <ImportNodes />
                <ExportNodes />
            </Tab>
            <Tab label="About">
                <h3>Website created and designed by DiogenesTheDog.</h3>
            </Tab>
            
            </Tabs>

            <button style={{width: "100%"}} onClick={() => setShowStore(!showStore)}>Gargoyles.Store</button>
        </Window>
        )}

        {showStore && (
        <FloatingWindow
            open={showStore}
            onClose={() => setShowStore(false)}
            title="Store"
        >
            <Store />
        </FloatingWindow>
        )}
    </div>
    );
}