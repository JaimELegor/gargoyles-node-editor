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


export default function Menu(){
    const { isActive } = useActiveFilter();
    const { setSelectedNode } = useNode();
    const { theme } = useTheme();  
    
    const logoImage = theme === 'dark' ? '/logo-dark.png' : '/logo2.png';
    
    return (
    <div className="menu-parent"> 
        {isActive ? (
            <>
            <Window title="model.glb" close={() => setSelectedNode(null)}>
                <ThreeScene />
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
        </Window>
        )}
    </div>
    );
}