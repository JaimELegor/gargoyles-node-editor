import '../styles/TopBar.css';
import { useState } from 'react';
export default function TopBar() {
    const [open, setOpen] = useState(false);
    return (
        <>

            <div className="topbar">
                <div className="menu-wrapper">
                    <div className="menu-button" id="appearanceBtn" onClick={() => setOpen(!open)}>Appearance</div>
                    {open && (
                <div className="dropdown" id="appearanceMenu">
                    <div className="dropdown-item" > Green Mode</div>
                    <div className="dropdown-item" >Dark Mode</div>
                    <div className="dropdown-item" >CRT Mode</div>
                </div>
                )
            }
                </div>

                
            </div>

            
            
    </>
  );
}
