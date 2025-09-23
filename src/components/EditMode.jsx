
import "../styles/EditMode.css";
import { useMode } from "../contexts/ModeContext";

export default function EditMode() {

  const modes = ["zoom", "move", "edit", "link"];
  const { activeMode, setActiveMode } = useMode();
  const setMode = (mode) => {
    if(activeMode === mode) {
        setActiveMode(null);
    } else {
        setActiveMode(mode);
    }
  }

  return (
    <div className="edit-mode">
        {modes.map((mode) => (
        <div className="mode-wrapper" id={mode} key={mode}>
            <div
            
            key={mode}
            id={mode}
            className={activeMode === mode ? "mode" : "mode-disabled"}
            onClick={() => setMode(mode)}
        >
            {mode}
        </div>
        </div> 
        ))}
    </div>
    );
}